import { extract, ExampleData, AnnotatedDocument } from "langextract";
import { config } from "../config";
import fs from "fs";
import { saveExtractedRules } from "../services/db";

async function seedGraph() {
  // 🧪 Example-based semantic extraction
  const examples: ExampleData[] = [
    {
      text: "Rock defeats Scissors",
      extractions: [
        {
          extractionClass: "game_rule",
          extractionText: "Rock defeats Scissors",
          attributes: {
            winner: "Rock",
            loser: "Scissors",
            action: "crushes",
            condition: "standard play",
          },
        },
      ],
    },
    {
      text: "If both players choose the same option, the game ends in a draw.",
      extractions: [
        {
          extractionClass: "game_rule",
          extractionText:
            "If both players choose the same option, the game ends in a draw.",
          attributes: {
            interaction: "draw",
            option: "Rock",
            condition: "same option chosen",
          },
        },
      ],
    },
  ];

  // 📜 Load rules from file
  const rawText = fs.readFileSync("./rules.txt", "utf-8");

  // 🧠 Extract semantic rules using Gemini
  const result = await extract(rawText, {
    promptDescription: `
    Extract semantic game rules including:
    - winner, loser, action, and condition for defeat rules
    - interaction, option, and condition for draw rules

    Return one draw rule for each option.
    Do not include any formatting or markdown.
    `,
    examples,
    modelType: "gemini",
    apiKey: config.gemini.apiKey,
    modelId: config.gemini.chatModel,
  });

  // 🧬 Normalize result to array
  const documents: AnnotatedDocument[] = Array.isArray(result)
    ? result
    : [result];

  // Get rules from local in case LLM returns no expected results
  // const rawData = fs.readFileSync("./rules.json", "utf-8");
  // const documents = JSON.parse(rawData);

  console.log("🧠 Extracted Rules:");
  console.log(JSON.stringify(documents, null, 2));

  // 💾 Persist extracted rules in Neo4j
  await saveExtractedRules(documents);

  console.log("✅ Rules persisted in Neo4j.");
}

seedGraph();
