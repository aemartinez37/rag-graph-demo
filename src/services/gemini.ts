import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export async function getGeminiQuery(question: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: config.gemini.chatModel });
  const prompt = `You are a Cypher expert. Given the question: "${question}", generate a Cypher query to answer it.
The graph contains nodes of type Move with [:BEATS {action}] relationships.
Return the move names and the action in the format: a.name, r.action, b.name.
Do NOT include Markdown formatting.
If you reuse variables across MATCH clauses, include a WITH clause.`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function getGeminiResponse(
  question: string,
  fact: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: config.gemini.chatModel });
  const prompt = `Answer the question: "${question}" using this rule(s): "${fact}".`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
