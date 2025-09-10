import Fastify from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import { runCypher } from "./services/db";
import { getGeminiQuery, getGeminiResponse } from "./services/gemini";

const app = Fastify();

app.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

app.post("/ask", async (req: any, reply) => {
  const { question } = req.body ?? {};
  if (!question) return reply.code(400).send({ error: "Missing question" });

  try {
    // Step 1: Generate Cypher query from LLM
    const cypherQuery = await getGeminiQuery(question);
    console.log("Generated Cypher Query:", cypherQuery);

    // Step 2: Run Cypher query
    const result = await runCypher(cypherQuery);

    console.log("+++ Cypher Query Result:", result);
    const values = result.join(", ") || "No result found";

    // Step 3: Generate natural language response
    console.log("--> Cypher Query Result:", values);
    const response = await getGeminiResponse(question, values);

    reply.send({ response });
  } catch (err) {
    reply.status(500).send({ error: "Something went wrong", details: err });
  }
});

app.listen({ port: 3000 }, () => {
  console.log("🚀 Fastify server running at http://localhost:3000");
});
