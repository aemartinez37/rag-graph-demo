import neo4j from "neo4j-driver";
import { config } from "../config";

const driver = neo4j.driver(
  config.neo4j.uri,
  neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
);

export async function runCypher(query: string): Promise<string[]> {
  const session = driver.session();
  try {
    const result = await session.run(query);
    return result.records.map((r) => r.map((f) => f.toString()).join(" "));
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  await driver.close();
}
