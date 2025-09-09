import Fastify from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import { answer } from "./generate";

const app = Fastify();

app.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

app.post("/ask", async (req: any, reply) => {
  const { question } = req.body ?? {};
  if (!question) return reply.code(400).send({ error: "Missing question" });
  const result = await answer(question);
  return reply.send(result);
});

(async () => {
  await app.listen({ port: 3000 });
  console.log("API running at http://localhost:3000");
})();
