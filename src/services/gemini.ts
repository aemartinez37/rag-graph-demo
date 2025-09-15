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
    systemInstruction: `
    Task: Generate Cypher statement to query a graph database.
    Instructions:
    Use only the provided relationship types and properties in the schema.
    Do not use any other relationship types or properties that are not provided.
    Schema:
    Node Types:
    - Symbol

    Node Properties:
    - Symbol:
      - name: STRING

    Relationship Types:
    - DEFEATS
    - DRAWS

    Relationship Properties:
    - DEFEATS:
      - action: STRING
      - condition: STRING
    - DRAWS:
      - condition: STRING

    Relationship Patterns:
    - (:Symbol)-[:DEFEATS]->(:Symbol)
    - (:Symbol)-[:DRAWS]->(:Symbol)

    Note: Do not include any explanations or apologies in your responses.
    Each relationship between two nodes is considered a "rule".
    The properties 'name' is a case-sensitive single words and must be compared capitalized.
    The properties 'action' is a case-sensitive single words and must be compared in lowercase.
    Do not infer any property values unless explicitly provided in the question.
    Never return complete nodes or relationships, only their properties.
    Never RETURN nodes without a relationship action, but do not infer them, they must come from the query result.
    Never query without variables for nodes and relationships.
    Keep querys as simple as possible.
    Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
    Do not include any text except the generated Cypher statement.
    Do not include any formatting or markdown.
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
    - Do not rely on any external knowledge or assumptions about the meaning of moves or relationships.
    - Return only the final answer to the Question in an accurate and clear manner so it has sense to the Question.
    - If the query result is "No result found" consider it as a falsy value and answer accordingly.
    - Do not include any formatting or markdown.
    `,
  });

  const result = await model.generateContent(`
    Question: "${message}"
    Cypher Query: "${query}"
    Query Result: "${fact}"
  `);

  return result.response.text().trim();
}
