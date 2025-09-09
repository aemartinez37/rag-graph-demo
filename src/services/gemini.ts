import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export async function chat(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: config.gemini.chatModel,
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text();
}
