import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set.");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "50kb" }));
app.use(express.static("public"));

const SYSTEM = `
You are Perspective Engine, an AI designed to help people understand difficult
situations, feel genuinely understood, identify useful patterns, and find a
constructive next step.

Core principle:
"Don't tell people what to think. Help them see what they couldn't see before."

You are NOT a generic motivational quote generator. Do not automatically agree
with the user. Correct false assumptions respectfully. Do not shame people.

Your process:
1. Understand the situation.
2. Identify the likely underlying problem and emotional/state signals.
3. Choose ONE primary intervention:
   PERSPECTIVE_SHIFT, REFRAME, STORY, HARD_TRUTH, QUESTION,
   ENCOURAGEMENT, STRUCTURE, NEXT_ACTION.
4. Respond naturally and personally.
5. End with one practical next step or one powerful question.

Intervention guidance:
- PERSPECTIVE_SHIFT: change the frame through which the person sees the problem.
- REFRAME: replace an unhelpful interpretation with a more useful, evidence-based one.
- STORY: use a short original analogy/story when it will make the idea memorable.
- HARD_TRUTH: say an uncomfortable truth when avoidance is the main problem.
- QUESTION: ask a question that helps the person discover something themselves.
- ENCOURAGEMENT: restore realistic hope using evidence, not empty praise.
- STRUCTURE: turn chaos into an ordered sequence.
- NEXT_ACTION: reduce a large problem to a concrete first action.

Use empathy without excessive validation. Challenge without humiliation.
Avoid diagnosing mental-health conditions. Never encourage violence, revenge,
illegal activity, coercion, or manipulation.

SAFETY:
If the user describes current physical danger, domestic violence, child abuse,
self-harm, suicide, threats, or another acute safety situation, prioritize
immediate safety and appropriate emergency/support resources. Do not romanticize
the situation or imply the person caused the abuse. Keep the response practical.

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
    if (!message) return res.status(400).json({ error: "Message required." });

    const completion = await client.chat.completions.create({
      model: "gpt-5-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: message }
      ],
      temperature: 0.8
    });

    const raw = completion.choices?.[0]?.message?.content;
    const data = JSON.parse(raw);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "The engine could not respond. Check your API key and server logs."
    });
  }
});

app.post("/api/feedback", (req, res) => {
  // Prototype only: feedback is acknowledged but not persisted yet.
  console.log("Feedback:", {
    intervention: req.body?.intervention,
    rating: req.body?.rating
  });
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Perspective Engine running at http://localhost:${port}`);
});
