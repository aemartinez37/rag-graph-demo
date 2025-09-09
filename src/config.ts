import 'dotenv/config';

export const config = {
  neo4j: {
    uri: process.env.NEO4J_URI!,
    user: process.env.NEO4J_USER!,
    password: process.env.NEO4J_PASSWORD!,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY!,
    embeddingModel: process.env.EMBEDDING_MODEL ?? 'embedding-001',
    chatModel: process.env.CHAT_MODEL ?? 'gemini-1.5-flash',
  },
};
