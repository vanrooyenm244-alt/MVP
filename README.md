# Perspective Engine — Prototype

A small prototype for an AI that helps people see difficult situations more clearly.

## Core idea

> Don't tell people what to think. Help them see what they couldn't see before.

The prototype:
1. Receives a person's situation.
2. Classifies the likely problem/state.
3. Selects an intervention.
4. Generates a personalized perspective shift.
5. Gives one practical next step.
6. Collects simple feedback.

## Intervention types

- PERSPECTIVE_SHIFT
- REFRAME
- STORY
- HARD_TRUTH
- QUESTION
- ENCOURAGEMENT
- STRUCTURE
- NEXT_ACTION

## Run locally

Requires Node.js 18+.

```bash
npm install
cp .env.example .env
# Add your OpenAI API key to .env
npm start
```

Open http://localhost:3000

## Important

This is an experimental prototype, not a therapist or crisis service.
For immediate danger, violence, self-harm, or other emergencies, the app should direct users to appropriate local emergency/support services rather than trying to solve the situation with motivational content.

## Next experiment

Give the link to 20–50 people and collect:
- Did it understand you?
- Did it make you see the situation differently?
- Was the response useful?
- Which intervention helped most?
- What did it get wrong?
