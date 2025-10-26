import neo4j from "neo4j-driver";
import { config } from "../config";
import { AnnotatedDocument } from "langextract";

const driver = neo4j.driver(
  config.neo4j.uri,
  neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
);

export async function closeDriver() {
  await driver.close();
}

export async function saveExtractedRules(
  document: AnnotatedDocument
): Promise<void> {
  const session = driver.session();

  try {
    // Clean existing rules
    await session.run(`MATCH (s:Move) DETACH DELETE s`);

    // Save new rules
    if (!document.extractions || !Array.isArray(document.extractions)) return;

    for (const extraction of document.extractions) {
      const attrs = extraction.attributes;
      if (!attrs) continue;

      if (extraction.extractionClass === "tie_rule") {
        const { option } = attrs;
        // For tie, self-referential relationship
        await session.run(
          `
            MERGE (s:Move {name: $option})
            MERGE (s)-[:TIES]->(s)
            `,
          { option }
        );
      } else {
        const { winner, loser, action } = attrs;
        await session.run(
          `
            MERGE (w:Move {name: $winner})
            MERGE (l:Move {name: $loser})
            MERGE (w)-[:DEFEATS {action: $action}]->(l)
            MERGE (l)-[:LOSES_TO]->(w)
            `,
          { winner, loser, action }
        );
      }
    }
  } catch (err) {
    console.error("Error saving rules:", err);
  } finally {
    await session.close();
    await closeDriver();
  }
}
