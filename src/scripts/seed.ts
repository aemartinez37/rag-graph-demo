import neo4j from "neo4j-driver";
import { config } from "../config";

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
      CREATE (:Move {name: "Rock"}),
             (:Move {name: "Paper"}),
             (:Move {name: "Scissors"})
    `);

    console.log("🔗 Creating relationships with action...");
    await session.run(`
      MATCH (r:Move {name: "Rock"}), (s:Move {name: "Scissors"})
      CREATE (r)-[:BEATS {action: "crushes"}]->(s)
    `);

    await session.run(`
      MATCH (s:Move {name: "Scissors"}), (p:Move {name: "Paper"})
      WITH s, p
      CREATE (s)-[:BEATS {action: "cuts"}]->(p)
    `);

    await session.run(`
      MATCH (p:Move {name: "Paper"}), (r:Move {name: "Rock"})
      WITH p, r
      CREATE (p)-[:BEATS {action: "covers"}]->(r)
    `);

    console.log("✅ Graph seeded successfully.");
  } catch (err) {
    console.error("❌ Error seeding graph:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedGraph();
