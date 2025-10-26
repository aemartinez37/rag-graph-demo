import { extract, ExampleData } from "langextract";
import { config } from "../config";
import fs from "fs";
import { saveExtractedRules } from "../services/db";

type allowedRPSVersions = "3";

const RPS_VERSION: allowedRPSVersions = "3";

async function seedGraph() {
  const examples: ExampleData[] = [
    {
      text: "Rock crushes Scissors",
      extractions: [
        {
          extractionClass: "tie_rule",
          extractionText: "Rock",
          attributes: {
            option: "Rock",
          },
        },
      ],
    },
    {
      text: "Rock crushes Scissors",
      extractions: [
        {
          extractionClass: "regular_rule",
          extractionText: "Rock crushes Scissors",
          attributes: {
            winner: "Rock",
            loser: "Scissors",
            action: "crushes",
          },
        },
      ],
    },
  ];

  // ** Get rules from LLM extraction ** //
  const rawText = fs.readFileSync(`./rules/rps-${RPS_VERSION}.txt`, "utf-8");
  const result = await extract(rawText, {
    promptDescription: `
    Extract game rules including:
    - winner, loser, action for regular rules
    - option for tie rules

    Return one tie rule for each option.
    Do not include any formatting or markdown.
    `,
    examples,
    modelType: "gemini",
    apiKey: config.gemini.apiKey,
    modelId: config.gemini.chatModel,
  });

  // Save extraction result
  fs.writeFileSync(
    `./rules/rps-${RPS_VERSION}.json`,
    JSON.stringify(result, null, 2),
    "utf-8"
  );
  // ** //

  const rawData = fs.readFileSync(`./rules/rps-${RPS_VERSION}.json`, "utf-8");
  const documents = JSON.parse(rawData);

  // Persist rules in Neo4j
  await saveExtractedRules(documents);
  console.log("Rules persisted in Neo4j.");
}

seedGraph();
