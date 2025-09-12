import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";

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
    systemInstruction: `Task: Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
Node properties are the following:
Move {name: STRING}
Relationship properties are the following:
BEATS {action: STRING}
The relationships are the following:
(:Move) - [:BEATS] -> (:Move)
Note: Do not include any explanations or apologies in your responses.
Each relationship between two nodes is considered a "rule".
The properties 'name' and 'action' are case-sensitive single words and must be compared in lowercase.
Do not infer any property values unless explicitly provided in the question.
Never use relationship 'action' property to query.
Never return complete nodes or relationships, only their properties.
Never RETURN nodes without a relationship action, but do not infer them, they must come from the query result.
Never query without variables for nodes and relationships.
Keep querys as simple as possible.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
Do not include any formatting or markdown.`,
  });
  const prompt = `The question is: "${message}"
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function getGeminiResponse(
  message: string,
  query: string,
  fact: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: config.gemini.chatModel,
    systemInstruction: `You are an expert natural language interpreter for Neo4j query results.

Your task is to answer a user's question using the result of a Cypher query.

Inputs:
- Question: A natural language question about a graph-based system of moves and relationships.
- Cypher Query: The Cypher query that was executed to obtain the Query Result.
- Query Result: A string returned from a Cypher query. This result may be:
  - A single word representing a move (e.g., "rock", "paper", "scissors").
  - A descriptive rule or statement (e.g., "rock crushes scissors").

Instructions:
- If the query result is a single word, use it directly to answer the question clearly and concisely.
- If the query result is a descriptive rule or statement, use that rule to answer the question in natural language.
- Do not rely on any external knowledge or assumptions about the meaning of moves or relationships.
- Do not include any formatting or markdown.
- Return only the final answer to the question in an explanatory manner.
- If the query result is "No result found" or does not provide relevant information, respond with "I don't know".`,
  });

  const result = await model.generateContent(`Question: "${message}"
Cypher Query: "${query}"
Query Result: "${fact}"`);
  return result.response.text().trim();
}
