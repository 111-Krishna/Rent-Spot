import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import ResolutionClaim from "../models/ResolutionClaim.js";
import { generateGeminiReply } from "../utils/geminiClient.js";
import { buildHostGuestMessagePrompt, buildResidentExpertPrompt } from "../utils/residentExpertPrompt.js";

const EMERGENCY_REGEX = /\b(fire|injury|police|illegal|assault|threat)\b/i;
const ANGRY_REGEX = /\b(angry|furious|terrible|awful|unacceptable|lawsuit|report you|fraud|harass)\b/i;
const BOOKING_REGEX = /\b(cancel|refund|status|dates|booking|modify|change)\b/i;
const LISTING_REGEX = /\b(wifi|wi-fi|parking|check[- ]?in|code|house rules|amenities)\b/i;
const OFF_PLATFORM_PAYMENT_REGEX = /\b(cash|venmo|off-platform|off platform|paypal friends|bank transfer)\b/i;

const toPaymentStatus = (bookingStatus) => {
  if (bookingStatus === "confirmed") return "paid";
  if (bookingStatus === "cancelled") return "cancelled";
  return "pending";
};

const getBookingInfo = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate("user", "name");
  if (!booking) return null;

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
  if (!listing) return null;

  return {
    listingId: listing._id,
    title: listing.title,
    houseRules: listing.houseRules || null,
    checkInInstructions: listing.checkInInstructions || null,
    wifiCode: listing.wifiCode || null,
    parkingInstructions: listing.parkingInstructions || null,
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

  return { claimId: claim._id, status: claim.status, message: "Escalated to human support." };
};

const buildContext = (payload) => ({
  "User Type": payload.userRole,
  City: payload.city,
  "Check-in": payload.checkIn,
  "Check-out": payload.checkOut,
  Guests: payload.guests,
  Budget: payload.budget,
  "Listing Name": payload.listingName || payload.propertyName,
  "Listing Price": payload.listingPrice,
  Amenities: payload.amenities,
  "House Rules": payload.houseRules,
  Cancellation: payload.cancellation,
  "Conversation Goal": payload.conversationGoal,
  booking_id: payload.bookingId,
  listing_id: payload.listingId,
});

const getRealtimeReply = async ({ systemPrompt, message, context, toolCalls }) => {
  const toolSummary = toolCalls.length
    ? JSON.stringify(toolCalls.map((entry) => ({ tool: entry.tool, result: entry.result })), null, 2)
    : "No tool calls used.";

  const userPrompt = `User message: ${message}\n\nContext:\n${JSON.stringify(context, null, 2)}\n\nTool outputs:\n${toolSummary}`;
  return generateGeminiReply({ systemPrompt, userPrompt });
};

export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Booking id is required" });

    const data = await getBookingInfo(id);
    if (!data) return res.status(404).json({ message: "Booking not found" });

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getListingInfo = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Listing id is required" });

    const data = await getHouseManual(id);
    if (!data) return res.status(404).json({ message: "Listing not found" });

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createResolutionClaim = async (req, res) => {
  try {
    const { bookingId, listingId, requesterRole, description, issueType, priority } = req.body;
    if (!description?.trim()) return res.status(400).json({ message: "description is required" });

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
    const { message = "", userRole = "Guest", bookingId, listingId } = req.body;

    const lowerMessage = message.toLowerCase();
    const toolCalls = [];
    const context = buildContext(req.body);
    const systemPrompt = buildResidentExpertPrompt(context);

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
          "I’m sorry this is happening. Please contact emergency services right now (911 or your local emergency number). I’ve also flagged this to our human support team for urgent follow-up.",
      });
    }

    if (OFF_PLATFORM_PAYMENT_REGEX.test(lowerMessage)) {
      return res.json({
        systemPrompt,
        toolCalls,
        reply:
          "For your safety, payments must stay on-platform. I can’t help with cash, Venmo, or other off-platform payment methods because they remove protection and support coverage.",
      });
    }

    if (ANGRY_REGEX.test(lowerMessage)) {
      const escalation = await escalateToHuman({
        bookingId,
        listingId,
        requesterRole: String(userRole).toLowerCase(),
        description: `Sensitive/angry conversation: ${message}`,
        issueType: "other",
        priority: "high",
      });
      toolCalls.push({ tool: "escalate_to_human", result: escalation });
    }

    if (BOOKING_REGEX.test(lowerMessage) && bookingId) {
      const bookingInfo = await getBookingInfo(bookingId);
      toolCalls.push({ tool: "get_booking_info", result: bookingInfo });

      if (!bookingInfo) {
        return res.json({
          systemPrompt,
          toolCalls,
          reply: "Let me check that for you. I couldn’t find that booking yet—could you confirm the booking ID?",
        });
      }
    } else if (BOOKING_REGEX.test(lowerMessage) && !bookingId) {
      return res.json({
        systemPrompt,
        toolCalls,
        reply: "I can help with that. Please share your booking ID so I can check the exact dates and status.",
      });
    }

    if (LISTING_REGEX.test(lowerMessage) && listingId) {
      const houseManualData = await getHouseManual(listingId);
      toolCalls.push({ tool: "get_house_manual", result: houseManualData });

      if (!houseManualData) {
        return res.json({
          systemPrompt,
          toolCalls,
          reply: "Let me check that for you. I couldn't find those listing details yet. Can you confirm the listing ID?",
        });
      }
    } else if (LISTING_REGEX.test(lowerMessage) && !listingId) {
      return res.json({
        systemPrompt,
        toolCalls,
        reply: "I can check that for you. Could you share the listing ID or listing name so I can verify check-in and property details?",
      });
    }

    const llmReply = await getRealtimeReply({ systemPrompt, message, context, toolCalls });

    return res.json({
      systemPrompt,
      toolCalls,
      reply:
        llmReply ||
        "Let me check that for you. I can help with booking details, check-in info, cancellation steps, and support policies.",
      generatedBy: llmReply ? "gemini" : "fallback",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const draftHostMessage = async (req, res) => {
  try {
    const { guestName = "there", bookingDetails = "", messageTopic = "", guestUsedEmoji = false } = req.body;

    const systemPrompt = buildHostGuestMessagePrompt({
      guestName,
      bookingDetails,
      messageTopic,
      guestUsedEmoji,
    });

    const userPrompt = `Draft a host message to the guest. Topic: ${messageTopic || "booking confirmation"}. Booking details: ${bookingDetails || "not provided"}.`;
    const llmReply = await generateGeminiReply({ systemPrompt, userPrompt, temperature: 0.3, maxOutputTokens: 180 });

    if (llmReply) {
      return res.json({ message: llmReply });
    }

    const base = `Hi ${guestName}, thanks for your message. ${messageTopic || "I wanted to confirm your booking details."}`.trim();
    const bookingLine = bookingDetails ? ` Booking details: ${bookingDetails}.` : "";
    let draft = `${base}${bookingLine} Please let me know if you'd like anything else before arrival.`;

    draft = draft.replace(/\s+/g, " ").trim();
    if (!guestUsedEmoji) {
      draft = draft.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
    }

    if (draft.length > 120) {
      draft = `${draft.slice(0, 117).trimEnd()}...`;
    }

    return res.json({ message: draft });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
