import Fastify from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import { runCypher } from "./services/db";
import { getGeminiQuery, getGeminiResponse } from "./services/gemini";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { ChatVertexAI } from "@langchain/google-vertexai"; // Gemini wrapper
import { GraphCypherQAChain } from "@langchain/community/chains/graph_qa/cypher";
import { config } from "./config";

const app = Fastify();

app.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

app.post("/ask", async (req: any, reply) => {
  let { question } = req.body ?? {};
  if (!question) return reply.code(400).send({ error: "Missing question" });

  try {
    // Step 1: Generate Cypher query from LLM
    const cypherQuery = await getGeminiQuery(question);
    // console.log("Generated Cypher Query:", "--", cypherQuery, "--");

    // Step 2: Run Cypher query
    const result = await runCypher(cypherQuery);

    const values = result || "No result found";

    // Step 3: Generate natural language response
    // console.log("--> Cypher Query Result:", values);
    const response = await getGeminiResponse(
      question,
      cypherQuery,
      JSON.stringify(values)
    );

    reply.send({ response });

    // ---------------------------------------

    // // Step 1: Connect to Neo4j
    // const graph = await Neo4jGraph.initialize({
    //   url: config.neo4j.uri,
    //   username: config.neo4j.user,
    //   password: config.neo4j.password,
    // });

    // // Step 2: Initialize Gemini (via Vertex AI)
    // const model = new ChatVertexAI({
    //   model: config.gemini.chatModel,
    //   temperature: 0.3,
    //   maxOutputTokens: 1024,
    //   apiKey: config.gemini.apiKey,
    // });

    // // Step 3: Create the QA Chain
    // const chain = await GraphCypherQAChain.fromLLM({
    //   llm: model,
    //   graph: graph,
    //   returnIntermediateSteps: true,
    // });

    // console.log("Chain created, processing question:", question);
    // // Step 4: Ask a question
    // const response = await chain.invoke({ query: question });
    // console.log("Generated Cypher:", response.intermediateSteps?.cypher);
    // console.log("Raw Result:", response);
    // reply.send({ response });
  } catch (err) {
    console.error("Error processing /ask:", err);
    reply.status(500).send({ error: "Something went wrong", details: err });
  }
});

app.listen({ port: 3000 }, () => {
  console.log("🚀 Fastify server running at http://localhost:3000");
});
