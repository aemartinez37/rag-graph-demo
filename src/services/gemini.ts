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

export async function getGeminiResponse(
  message: string,
  query: string,
  fact: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: config.gemini.chatModel,
    systemInstruction: `
    You are an expert natural language interpreter for Neo4j query results.

    Your task is to answer a user's question using the result of a Cypher query.

    Inputs:
    - Question: A natural language question about a graph-based system of moves and relationships.
    - Cypher Query: The Cypher query that was executed to obtain the Query Result.
    - Query Result: A JSON string returned from the Cypher Query.

    Instructions:
    - Analyze the Cypher Query and Query Result to understand the relationships and properties involved.
    - DO NOT rely on any external knowledge or assumptions about the meaning of moves or relationships.
    - Return only the final answer to the Question in an accurate and clear manner so it has sense to the Question.
    - If the query result is "No result found" consider it as a falsy value and answer accordingly.
    - DO NOT include any formatting or markdown.
    `,
  });

  const result = await model.generateContent(`
    Question: "${message}"
    Cypher Query: "${query}"
    Query Result: "${fact}"
  `);

  return result.response.text().trim();
}
