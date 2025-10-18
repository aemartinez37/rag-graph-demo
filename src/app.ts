import readline from "readline-sync";
import chalk from "chalk";
import { getGeminiQuery, getGeminiResponse } from "./services/gemini";
import { runCypher } from "./services/db";

process.stdout.write("\x1Bc");
console.log(
  chalk.greenBright(`
   _____                 _     _____            _____ 
  / ____|               | |   |  __ \\     /\\   / ____|
 | |  __ _ __ __ _ _ __ | |__ | |__) |   /  \\ | |  __ 
 | | |_ | '__/ _\` | '_ \\| '_ \\|  _  /   / /\\ \\| | |_ |
 | |__| | | | (_| | |_) | | | | | \\ \\  / ____ \\ |__| |
  \\_____|_|  \\__,_| .__/|_| |_|_|  \\_\\/_/    \\_\\_____|
                  | |                                 
                  |_|

╔════════════════════════════════════════════════════════════════════╗
║    🎮 Welcome to the Rock Paper Scissors & Beyond Assistant 🤖     ║
╚════════════════════════════════════════════════════════════════════╝
`)
);

(async () => {
  while (true) {
    const question = readline.question("\n🗣️  Ask your question: ");
    // Generate Cypher query
    const cypherQuery = await getGeminiQuery(question);

    // Execute generated query
    const result = await runCypher(cypherQuery);

    // Generate Natural Language response
    const response = await getGeminiResponse(
      question,
      cypherQuery,
      JSON.stringify(result)
    );

    console.log(chalk.greenBright(`\n🤖: ${response}`));
  }
})();
