const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const getGeminiApiKey = () => process.env.GEMINI_API_KEY || process.env.gemini_api_key || "";

const readGeminiText = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part?.text || "").join("\n").trim();
  return text || null;
};

export const generateGeminiReply = async ({ systemPrompt, userPrompt, temperature = 0.4, maxOutputTokens = 350 }) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return readGeminiText(data);
  } catch (error) {
    console.error("Gemini reply failed:", error.message);
    return null;
  }
};
