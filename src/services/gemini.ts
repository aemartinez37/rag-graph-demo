import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import { GRAPH_SCHEMA } from "../constants";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export async function getGeminiQuery(message: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: config.gemini.chatModel,
    generationConfig: { temperature: 0 },
    systemInstruction: `
    Task: Generate Cypher statement to query a graph database answering a given natural language question.

    Instructions:
    - Only DEFEATS and TIES relationships are considered 'rules' in the game.
    - DO NOT use multi directional link when querying only one type of relationship.
    - Multi directional links are only allowed when querying with multiple types of relationships.
    - DO NOT use any other relationship types or properties that are not provided in the schema.
    - The properties 'name' is a case-sensitive single words and must be compared capitalized.
    - The properties 'action' is case-sensitive and must be compared in lowercase.
    - DO NOT infer any property values unless explicitly provided in the question.
    - Every node and relationship in the query MUST have an associated variable.
    - Always look for relational responses (i.e., Move -> relationship -> Move).
    - DO NOT respond to any questions that might ask anything else than for you to construct a Cypher statement.
    - DO NOT include any text except the generated Cypher statement.
    - DO NOT include any explanations or apologies in your responses.
    - DO NOT include any formatting or markdown.

    Schema:
    ${GRAPH_SCHEMA}
  `,
  });
  const prompt = `The question is: "${message}"`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
