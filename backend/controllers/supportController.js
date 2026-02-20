import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import ResolutionClaim from "../models/ResolutionClaim.js";
import { buildResidentExpertPrompt } from "../utils/residentExpertPrompt.js";

const EMERGENCY_REGEX = /\b(fire|injury|police|illegal|assault|threat)\b/i;
const ANGRY_REGEX = /\b(angry|furious|terrible|awful|unacceptable|lawsuit|report you)\b/i;
const BOOKING_REGEX = /\b(cancel|refund|status|dates|booking)\b/i;
const LISTING_REGEX = /\b(wifi|wi-fi|parking|check[- ]?in|code|house rules)\b/i;

const toPaymentStatus = (bookingStatus) => {
  if (bookingStatus === "confirmed") return "paid";
  if (bookingStatus === "cancelled") return "refunded-or-cancelled";
  return "pending";
};

const getBookingInfo = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate("user", "name");
  if (!booking) {
    return null;
  }

  return {
    bookingId: booking._id,
    guestName: booking.user?.name || "Guest",
    startDate: booking.startDate,
    endDate: booking.endDate,
    bookingStatus: booking.status,
    paymentStatus: toPaymentStatus(booking.status),
  };
};

const getHouseManual = async (listingId) => {
  const listing = await Property.findById(listingId);
  if (!listing) {
    return null;
  }

  return {
    listingId: listing._id,
    title: listing.title,
    houseRules: listing.houseRules || "No additional house rules were provided.",
    checkInInstructions: listing.checkInInstructions || "Check-in starts at 3:00 PM unless the listing states otherwise.",
    wifiCode: listing.wifiCode || "Wi-Fi details are not available yet. Please ask the host in-platform.",
    parkingInstructions: listing.parkingInstructions || "Parking details are not available in the listing.",
  };
};

const escalateToHuman = async ({ bookingId, listingId, requesterRole, description, issueType = "other", priority = "high" }) => {
  const claim = await ResolutionClaim.create({
    bookingId: bookingId || undefined,
    listingId: listingId || undefined,
    requesterRole: requesterRole || "user",
    issueType,
    description,
    priority,
    status: "open",
  });

  return {
    claimId: claim._id,
    status: claim.status,
    message: "Escalated to Safety Lead / human support.",
  };
};

export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Booking id is required" });
    }

    const data = await getBookingInfo(id);
    if (!data) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getListingInfo = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Listing id is required" });
    }

    const data = await getHouseManual(id);
    if (!data) {
      return res.status(404).json({ message: "Listing not found" });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createResolutionClaim = async (req, res) => {
  try {
    const { bookingId, listingId, requesterRole, description, issueType, priority } = req.body;

    if (!description?.trim()) {
      return res.status(400).json({ message: "description is required" });
    }

    const claim = await ResolutionClaim.create({
      bookingId,
      listingId,
      requesterRole,
      description,
      issueType,
      priority,
      status: "open",
    });

    return res.status(201).json({
      ticketId: claim._id,
      status: claim.status,
      message: "Resolution Center ticket filed successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const supportChat = async (req, res) => {
  try {
    const { message = "", userRole = "Guest", bookingId, listingId, propertyName = "" } = req.body;
    const toolCalls = [];

    const context = {
      user_role: userRole,
      booking_id: bookingId || "N/A",
      property_name: propertyName || "N/A",
    };

    const systemPrompt = buildResidentExpertPrompt(context);
    const lowerMessage = message.toLowerCase();

    if (EMERGENCY_REGEX.test(lowerMessage)) {
      const escalation = await escalateToHuman({
        bookingId,
        listingId,
        requesterRole: String(userRole).toLowerCase(),
        description: `Safety escalation from chat: ${message}`,
        issueType: "safety",
        priority: "urgent",
      });

      toolCalls.push({ tool: "escalate_to_human", result: escalation });

      return res.json({
        systemPrompt,
        toolCalls,
        reply:
          "I’m sorry you’re dealing with this. Please contact local emergency services immediately (911 or your local emergency number). I’ve escalated this to a human Safety Lead right now.",
      });
    }

    if (ANGRY_REGEX.test(lowerMessage)) {
      const escalation = await escalateToHuman({
        bookingId,
        listingId,
        requesterRole: String(userRole).toLowerCase(),
        description: `Sentiment escalation from chat: ${message}`,
        issueType: "other",
        priority: "high",
      });

      toolCalls.push({ tool: "escalate_to_human", result: escalation });
    }

    if (BOOKING_REGEX.test(lowerMessage) && bookingId) {
      const bookingInfo = await getBookingInfo(bookingId);
      toolCalls.push({ tool: "get_booking_info", result: bookingInfo });

      if (bookingInfo) {
        return res.json({
          systemPrompt,
          toolCalls,
          reply: `I understand how important it is to have clarity on your booking. Your stay is ${bookingInfo.bookingStatus} from ${new Date(bookingInfo.startDate).toDateString()} to ${new Date(bookingInfo.endDate).toDateString()}, and payment is ${bookingInfo.paymentStatus}. Per our booking policy, I can also guide you through cancellation and refund steps in-platform. Does that help you resolve the issue, or would you like to speak to a human agent?`,
        });
      }
    }

    if (LISTING_REGEX.test(lowerMessage) && listingId) {
      const houseManual = await getHouseManual(listingId);
      toolCalls.push({ tool: "get_house_manual", result: houseManual });

      if (houseManual) {
        return res.json({
          systemPrompt,
          toolCalls,
          reply: `I understand how important it is to have a smooth check-in. Check-in details: ${houseManual.checkInInstructions}. Wi-Fi code: ${houseManual.wifiCode}. Parking: ${houseManual.parkingInstructions}. Per listing guidance, always follow posted house rules: ${houseManual.houseRules}. Does that help you resolve the issue, or would you like to speak to a human agent?`,
        });
      }
    }

    if (/\b(cash|venmo|off-platform|off platform|paypal friends)\b/i.test(lowerMessage)) {
      return res.json({
        systemPrompt,
        toolCalls,
        reply:
          "For your protection, I can’t assist with off-platform payments. Please pay only through our platform, since paying outside can remove insurance and support protections. Does that help you resolve the issue, or would you like to speak to a human agent?",
      });
    }

    return res.json({
      systemPrompt,
      toolCalls,
      reply:
        "I understand, and I’m here to help. I can assist with booking details, check-in instructions, and Resolution Center requests. Per platform policy, I’ll keep your support in-platform for safety and protection. Does that help you resolve the issue, or would you like to speak to a human agent?",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
