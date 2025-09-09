# RAG + Graph Database + Gemini Demo

This is a minimal Retrieval‑Augmented Generation (RAG) demo that combines:

- **Neo4j** as a graph database with vector search
- **Google Gemini API** for embeddings and chat
- **TypeScript + pnpm** for a clean developer experience

The demo shows how to **extend an LLM’s reasoning** without retraining:
- Classic Rock–Paper–Scissors answers come from Gemini’s baseline knowledge.
- New rules (Lizard, Spock) are stored in Neo4j and retrieved dynamically.

---

## 🚀 Features

- **Hybrid reasoning**: baseline LLM knowledge + custom graph‑stored rules
- **Vector search**: semantic retrieval of relevant rules
- **Live extensibility**: add new rules during the demo and see instant changes

---

## 📦 Requirements

- Node.js 20+
- pnpm
- Docker + Docker Compose
- Google Gemini API key ([get one here](https://ai.google.dev/))

---

## 🐳 Setup Neo4j

```bash
docker compose up -d
```
