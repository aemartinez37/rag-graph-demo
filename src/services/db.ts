import neo4j from "neo4j-driver";
import { config } from "../config";
import { getGeminiEmbedding } from "./gemini";

const driver = neo4j.driver(
  config.neo4j.uri,
  neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
);

export async function runCypher(query: string): Promise<string[]> {
  const session = driver.session();
  try {
    console.log("Running Cypher Query:", query);
    // query = await normalizeAndUpdateCypher(query);
    // console.log("Normalized Cypher Query:", query);
    const result = await session.run(query);
    console.log("Cypher Query Result:", result.records);
    return result.records.map((r) => r.map((f) => f.toString()).join(" "));
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  await driver.close();
}

async function normalizeAndUpdateCypher(rawQuery: string) {
  const action = extractAction(rawQuery);
  if (action === "") return rawQuery;

  const embedding = await getGeminiEmbedding(action);
  const bestMatch = await findBestMatchingAction(embedding);
  const normalizedQuery = rawQuery.replace(
    /action:\s*'[^']+'/,
    `action: '${bestMatch}'`
  );
  return normalizedQuery;
}

function extractAction(query: string): string {
  const match = query.match(/action:\s*'([^']+)'/);
  console.log("Extracted action:", match ? match[1] : "none");
  return match ? match[1] : "";
}

async function findBestMatchingAction(
  queryEmbedding: number[]
): Promise<string | null> {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      WITH $queryEmbedding AS queryVec
      MATCH ()-[r:BEATS]->()
      WHERE r.embedding IS NOT NULL
      WITH r,
          reduce(s = 0.0, i IN range(0, size(queryVec)-1) | s + queryVec[i] * r.embedding[i]) AS dotProduct,
          reduce(s = 0.0, i IN range(0, size(queryVec)-1) | s + queryVec[i]^2) AS queryNorm,
          reduce(s = 0.0, i IN range(0, size(r.embedding)-1) | s + r.embedding[i]^2) AS embeddingNorm
      WITH r, dotProduct / (sqrt(queryNorm) * sqrt(embeddingNorm)) AS score
      ORDER BY score DESC
      LIMIT 1
      RETURN r.action AS bestMatch, score
      `,
      { queryEmbedding }
    );

    const record = result.records[0];
    return record?.get("bestMatch") ?? null;
  } catch (error) {
    console.error("Error running similarity query:", error);
    return null;
  } finally {
    await session.close();
  }
}
