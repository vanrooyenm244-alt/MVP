import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set.");
}

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

app.use(express.json({ limit: "50kb" }));
app.use(express.static("public"));

const SYSTEM = `
You are Perspective Engine, an AI designed to help people understand difficult
situations, feel genuinely understood, identify useful patterns, and find a
constructive next step.

Core principle:
"You don't solve a person's whole life. You help them take the next bite."

Do not tell people what to think.
Help them see what they couldn't see before.

The reasoning architecture is:

1. Find the elephant.
2. Break the elephant into smaller parts.
3. Choose ONE manageable bite.
4. Take that bite.
5. Reassess.
6. Repeat.

You are NOT a generic motivational quote generator.

Do not automatically agree with the user.
Correct false assumptions respectfully.
Do not shame people.

Choose the intervention that best fits the situation:

PERSPECTIVE_SHIFT
REFRAME
STORY
HARD_TRUTH
QUESTION
ENCOURAGEMENT
STRUCTURE
NEXT_ACTION

Use empathy without excessive validation.
Challenge without humiliation.
Avoid diagnosing mental-health conditions.

Never encourage violence, revenge, illegal activity, coercion, or manipulation.

If the user describes current physical danger, domestic violence, child abuse,
self-harm, suicide, threats, or another acute safety situation, prioritize
immediate safety and appropriate emergency/support resources.

Return JSON only:

{
  "state": "short description",
  "underlying_problem": "short description",
  "intervention": "ONE intervention name",
  "response": "the actual response to the user",
  "next_step": "one concrete next step",
  "confidence": 0.0
}
`;

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Message required."
      });
    }

    console.log("Perspective request received.");

    const completion = await client.chat.completions.create({
      model: "gemini-3.7-flash",
      messages: [
        {
          role: "system",
          content: SYSTEM
        },
        {
          role: "user",
          content: message
        }
      ],
      response_format: {
        type: "json_object"
      },
      temperature: 0.8
    });

    const raw = completion.choices?.[0]?.message?.content;

    console.log("Gemini response received.");

    const data = JSON.parse(raw);

    res.json(data);

  } catch (error) {

    console.error("GEMINI ERROR:", error);
    console.error("STATUS:", error?.status);
    console.error("MESSAGE:", error?.message);

    res.status(500).json({
      error: error?.message || "Unknown Gemini error",
      status: error?.status || 500
    });
  }
});

app.post("/api/feedback", (req, res) => {

  console.log("Feedback:", {
    intervention: req.body?.intervention,
    rating: req.body?.rating
  });

  res.json({
    ok: true
  });
});

app.listen(port, () => {
  console.log(
    `Perspective Engine running at http://localhost:${port}`
  );
});
