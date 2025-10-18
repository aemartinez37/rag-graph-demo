import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import { GRAPH_SCHEMA } from "../constants";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export async function getGeminiEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({
    model: config.gemini.embeddingModel,
  });

  const result = await model.embedContent(text);

  return result.embedding.values;
}

export async function getGeminiQuery(message: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: config.gemini.chatModel,
    generationConfig: { temperature: 0.2 },
    systemInstruction: `
    Task: Generate Cypher statement to query a graph database answering a given natural language question.

    Instructions:
    - Use only the provided relationship types and properties in the given schema.
    - Do not use any other relationship types or properties that are not provided in the schema.
    - Do not include any explanations or apologies in your responses.
    - The properties 'name' is a case-sensitive single words and must be compared capitalized.
    - The properties 'action' is case-sensitive and must be compared in lowercase.
    - Do not infer any property values unless explicitly provided in the question.
    - Every node and relationship in the query MUST have an associated variable.
    - Always look for relational responses (i.e., symbol -> relationship -> symbol).
    - Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
    - Do not include any text except the generated Cypher statement.
    - Do not include any formatting or markdown.

    Schema:
    ${GRAPH_SCHEMA}
  `,
  });
  const prompt = `The question is: "${message}"`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
