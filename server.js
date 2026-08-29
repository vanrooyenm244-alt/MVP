import express from "express";

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json({ limit: "50kb" }));
app.use(express.static("public"));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set.");
}

const SYSTEM = `
You are Perspective Engine.

Your purpose is to help a person see their situation from a useful perspective.

Core principle:

"You don't solve a person's whole life.
You help them take the next bite."

Use this reasoning architecture:

1. Identify the elephant.
2. Break the elephant into smaller parts.
3. Find one manageable next step.
4. Take that step.
5. Reassess.
6. Repeat.

Do not give generic motivational quotes.

Do not automatically agree with the user.
Correct false assumptions respectfully.

Help the person understand what may actually be happening beneath
the surface of their situation.

Use empathy without excessive validation.

Challenge without humiliation.

Do not diagnose mental-health conditions.

Do not encourage violence, revenge, illegal activity, coercion,
or manipulation.

If someone describes immediate physical danger, domestic violence,
child abuse, self-harm, suicide, or another acute safety situation,
prioritize immediate safety and appropriate emergency/support resources.

For normal situations, give the person:

1. A useful perspective on what may be happening.
2. One important thing they may not be seeing.
3. ONE next step.

Keep the response human, direct and practical.

Do not sound like a therapist, corporate coach, or motivational poster.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Message required."
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server."
      });
    }

    console.log("Perspective request received.");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: SYSTEM
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("GEMINI API ERROR:", result);

      return res.status(response.status).json({
        error:
          result?.error?.message ||
          "Gemini API request failed.",
        status: response.status
      });
    }

    const text =
      result?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!text) {
      console.error("Gemini returned no text:", result);

      return res.status(500).json({
        error: "Gemini returned no text response."
      });
    }

    console.log("Gemini response received.");

    res.json({
      response: text
    });

  } catch (error) {

    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: error?.message || "Unknown server error."
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
  console.log(`Perspective Engine running on port ${port}`);
});
