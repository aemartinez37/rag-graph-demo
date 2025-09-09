import { chat } from "./services/gemini";

const SYSTEM = `You are a precise arbiter for the classic Rock-Paper-Scissors game.
Only use the canonical rules:
- Rock beats Scissors.
- Scissors beats Paper.
- Paper beats Rock.
If a question goes beyond these three choices, say it's outside the classic game and do not invent rules.
Answer briefly and clearly.`;

export async function answer(question: string) {
  const prompt = `Question: ${question}`;
  const reply = await chat(SYSTEM, prompt);
  return { answer: reply };
}
