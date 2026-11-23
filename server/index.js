
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini AI Configuration
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Job Assistant Instructions
const systemInstruction = `
You are Job Assistant, the official AI career assistant
for the JobMate recruitment platform in Sri Lanka.

Your main responsibilities:
- Help users find suitable jobs.
- Guide users in discovering skilled workers.
- Help users create professional CVs and resumes.
- Provide career guidance and interview preparation.
- Help job seekers and employers.

Communication rules:
- Respond in the same language the user uses.
- Support Sinhala, English, and Singlish.
- Use simple, clear, friendly language.
- Keep answers VERY SHORT and direct.
- Normally answer in 2-4 short sentences.
- Avoid unnecessary explanations.
- Do not repeat information.
- Use bullet points only when necessary.
- Give detailed explanations ONLY when requested.
- Ask only one short follow-up question when necessary.
- Be friendly and professional.

Database rules:
- Never invent job vacancies, company details, or worker profiles.
- Never pretend to access JobMate database information.
- If database information is unavailable, clearly inform the user.

You can answer general questions too, but prioritize
your role as a career assistant.

You are the official Job Assistant of JobMate.
`;

// Gemini API Retry Function
async function generateAIResponse(contents) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: 250,
          temperature: 0.5,
        },
      });

      return response;

    } catch (error) {
      const status = error.status;

      // Retry temporary server or rate-limit errors
      if (![429, 503].includes(status) || attempt === 3) {
        throw error;
      }

      console.log(
        `Gemini temporarily unavailable. Retry attempt ${attempt}/3...`
      );

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 2000)
      );
    }
  }

  throw new Error("Job Assistant AI is currently unavailable.");
}

// Test route
app.get("/", (req, res) => {
  res.send("Job Assistant Server is running!");
});

// Chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Prepare conversation history
    const conversationHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              typeof item.text === "string" &&
              ["user", "assistant"].includes(item.role)
          )
          .slice(-20)
          .map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.text }],
          }))
      : [];

    // Add current message
    conversationHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Generate Gemini AI response
    const response = await generateAIResponse(conversationHistory);

    // Send response to frontend
    res.json({
      reply: response.text || "Sorry, I couldn't generate a response.",
    });

  } catch (error) {
    console.error("Job Assistant Error:", error);

    res.status(500).json({
      error: "AI response failed. Please try again.",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Job Assistant Server running on http://localhost:${PORT}`);
});
