import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.gemini_api_key || "";

let _client = null;
const getClient = () => {
  if (!_client) {
    const key = getApiKey();
    if (!key) {
      console.warn("⚠️  No Gemini API key found — chat will use fallback replies.");
      return null;
    }
    _client = new GoogleGenerativeAI(key);
  }
  return _client;
};

/**
 * Send a single-turn request to Gemini and return the text reply.
 * Returns `null` on any failure so callers can fall back gracefully.
 */
export const generateGeminiReply = async ({
  systemPrompt,
  userPrompt,
  temperature = 0.5,
  maxOutputTokens = 400,
}) => {
  const client = getClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: { temperature, maxOutputTokens },
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response?.text?.();
    return text?.trim() || null;
  } catch (err) {
    console.error("❌ Gemini error:", err.message || err);
    return null;
  }
};
