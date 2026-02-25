import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import ResolutionClaim from "../models/ResolutionClaim.js";
import { generateGeminiReply } from "../utils/geminiClient.js";
import { buildHostGuestMessagePrompt, buildResidentExpertPrompt } from "../utils/residentExpertPrompt.js";

/* ── helpers ── */

const getBookingInfo = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId).populate("user", "name");
    if (!booking) return null;
    return {
      bookingId: booking._id,
      guestName: booking.user?.name || "Guest",
      startDate: booking.startDate,
      endDate: booking.endDate,
      bookingStatus: booking.status,
      paymentStatus: booking.status === "confirmed" ? "paid" : booking.status === "cancelled" ? "cancelled" : "pending",
    };
  } catch {
    return null;
  }
};

const getHouseManual = async (listingId) => {
  try {
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
  } catch {
    return null;
  }
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

/* ── main chat handler ── */

export const supportChat = async (req, res) => {
  try {
    const { message = "", userRole = "Guest", bookingId, listingId } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const lower = message.toLowerCase();
    const toolCalls = [];
    const hints = [];

    // ── Collect contextual data based on intent ──

    const isEmergency = /\b(fire|injury|police|illegal|assault|threat)\b/i.test(lower);
    const isAngry = /\b(angry|furious|terrible|awful|unacceptable|lawsuit|report you|fraud|harass)\b/i.test(lower);
    const isOffPlatform = /\b(cash|venmo|off-platform|off platform|paypal friends|bank transfer)\b/i.test(lower);
    const isBookingQuery = /\b(cancel|refund|status|dates|booking|modify|change)\b/i.test(lower);
    const isListingQuery = /\b(wifi|wi-fi|parking|check[- ]?in|code|house rules|amenities)\b/i.test(lower);

    if (isEmergency) {
      const esc = await escalateToHuman({
        bookingId, listingId,
        requesterRole: String(userRole).toLowerCase(),
        description: `Safety escalation: ${message}`,
        issueType: "safety",
        priority: "urgent",
      });
      toolCalls.push({ tool: "escalate_to_human", result: esc });
      hints.push("URGENT: User mentioned a safety emergency. Tell them to call emergency services immediately (911 or local). Confirm you have escalated to human support.");
    }

    if (isOffPlatform) {
      hints.push("User mentioned off-platform payments. Firmly explain that all payments must stay on-platform for their safety. Do not assist with cash, Venmo, PayPal, or bank transfers.");
    }

    if (isAngry) {
      const esc = await escalateToHuman({
        bookingId, listingId,
        requesterRole: String(userRole).toLowerCase(),
        description: `Frustrated user: ${message}`,
        issueType: "other",
        priority: "high",
      });
      toolCalls.push({ tool: "escalate_to_human", result: esc });
      hints.push("User seems upset. Acknowledge their frustration empathetically, apologize, and let them know a human agent has been notified.");
    }

    if (isBookingQuery) {
      if (bookingId) {
        const info = await getBookingInfo(bookingId);
        toolCalls.push({ tool: "get_booking_info", result: info });
        if (!info) hints.push("Booking lookup failed — ask user to double-check their booking ID.");
      } else {
        hints.push("User is asking about a booking but hasn't provided a booking ID. Ask them for it.");
      }
    }

    if (isListingQuery) {
      if (listingId) {
        const manual = await getHouseManual(listingId);
        toolCalls.push({ tool: "get_house_manual", result: manual });
        if (!manual) hints.push("Listing lookup failed — ask user to confirm listing ID or name.");
      } else {
        hints.push("User is asking about listing details but no listing ID provided. Ask for it.");
      }
    }

    // ── Build prompt & call Gemini ──

    const contextData = {
      userRole,
      city: req.body.city,
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      guests: req.body.guests,
      budget: req.body.budget,
      listingName: req.body.listingName,
      listingPrice: req.body.listingPrice,
      amenities: req.body.amenities,
      houseRules: req.body.houseRules,
      cancellation: req.body.cancellation,
    };

    const systemPrompt = buildResidentExpertPrompt(contextData)
      + (hints.length ? `\n\nADDITIONAL INSTRUCTIONS:\n${hints.map((h, i) => `${i + 1}. ${h}`).join("\n")}` : "");

    const toolSummary = toolCalls.length
      ? JSON.stringify(toolCalls.map(t => ({ tool: t.tool, result: t.result })), null, 2)
      : "No tool calls.";

    const userPrompt = `User message: ${message}\n\nContext:\n${JSON.stringify(contextData, null, 2)}\n\nTool outputs:\n${toolSummary}`;

    const reply = await generateGeminiReply({ systemPrompt, userPrompt });

    return res.json({
      reply: reply || "I'm having trouble connecting right now. Please try again in a moment.",
      toolCalls,
      generatedBy: reply ? "gemini" : "fallback",
    });
  } catch (error) {
    console.error("❌ supportChat error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ── other endpoints (unchanged) ── */

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
    const claim = await ResolutionClaim.create({ bookingId, listingId, requesterRole, description, issueType, priority, status: "open" });
    return res.status(201).json({ ticketId: claim._id, status: claim.status, message: "Resolution Center ticket filed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const draftHostMessage = async (req, res) => {
  try {
    const { guestName = "there", bookingDetails = "", messageTopic = "", guestUsedEmoji = false } = req.body;

    const systemPrompt = buildHostGuestMessagePrompt({ guestName, bookingDetails, messageTopic, guestUsedEmoji });
    const userPrompt = `Draft a host message to the guest. Topic: ${messageTopic || "booking confirmation"}. Booking details: ${bookingDetails || "not provided"}.`;
    const reply = await generateGeminiReply({ systemPrompt, userPrompt, temperature: 0.3, maxOutputTokens: 180 });

    if (reply) return res.json({ message: reply });

    // fallback
    let draft = `Hi ${guestName}, thanks for your message. ${messageTopic || "I wanted to confirm your booking details."}${bookingDetails ? ` Booking details: ${bookingDetails}.` : ""} Please let me know if you'd like anything else before arrival.`.replace(/\s+/g, " ").trim();
    if (!guestUsedEmoji) draft = draft.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
    if (draft.length > 120) draft = `${draft.slice(0, 117).trimEnd()}...`;

    return res.json({ message: draft });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
