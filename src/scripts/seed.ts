import neo4j from "neo4j-driver";
import { config } from "../config";
import { getGeminiEmbedding } from "../services/gemini";

const driver = neo4j.driver(
  config.neo4j.uri,
  neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
);

async function seedGraph() {
  const session = driver.session();

  try {
    console.log("🧹 Cleaning existing graph...");
    await session.run(`
      MATCH (n:Move) DETACH DELETE n
    `);

    console.log("🌱 Creating nodes...");
    await session.run(`
      CREATE (:Move {name: "rock"}),
             (:Move {name: "paper"}),
             (:Move {name: "scissors"})
    `);

    console.log("🔗 Creating relationships with action...");
    let action = "crushes";
    let actionEmbedding = await getGeminiEmbedding(action);
    await session.run(
      `
      MATCH (r:Move {name: "rock"}), (s:Move {name: "scissors"})
      CREATE (r)-[:BEATS {action: $action, embedding: $embedding}]->(s)
    `,
      { action, embedding: actionEmbedding }
    );

    action = "cuts";
    actionEmbedding = await getGeminiEmbedding(action);
    await session.run(
      `
      MATCH (s:Move {name: "scissors"}), (p:Move {name: "paper"})
      WITH s, p
      CREATE (s)-[:BEATS {action: $action, embedding: $embedding}]->(p)
    `,
      { action, embedding: actionEmbedding }
    );

    action = "covers";
    actionEmbedding = await getGeminiEmbedding(action);
    await session.run(
      `
      MATCH (p:Move {name: "paper"}), (r:Move {name: "rock"})
      WITH p, r
      CREATE (p)-[:BEATS {action: $action, embedding: $embedding}]->(r)
    `,
      { action, embedding: actionEmbedding }
    );

    console.log("✅ Graph seeded successfully.");
  } catch (err) {
    console.error("❌ Error seeding graph:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedGraph();
