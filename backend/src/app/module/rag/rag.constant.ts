export const RAG_ALLOWED_SOURCE_TYPES = [
    "DOC_MARKDOWN",
    "DOCTOR",
    "SPECIALTY",
] as const;

export type RagSourceType = (typeof RAG_ALLOWED_SOURCE_TYPES)[number];

export const RAG_DEFAULTS = {
    TOP_K: 5,
    MIN_SIMILARITY: 0.2,
    MAX_QUERY_LENGTH: 1200,
    MAX_INGEST_CONTENT_LENGTH: 20000,
    CHUNK_SIZE: Number(process.env.RAG_CHUNK_SIZE || 900),
    CHUNK_OVERLAP: Number(process.env.RAG_CHUNK_OVERLAP || 120),
    EMBEDDING_MODEL: process.env.RAG_EMBEDDING_MODEL || process.env.OPENROUTER_EMBEDDING_MODEL || "nvidia/llama-nemotron-embed-vl-1b-v2:free",
    GROQ_MODEL: process.env.RAG_GROQ_MODEL || "openai/gpt-oss-120b",
} as const;

export const RAG_DOC_DIRECTORIES = (process.env.RAG_DOC_DIRS || "docs")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const RAG_PROMPT_SYSTEM = `You are a clinical assistant for PH Healthcare backend knowledge.
Answer only from provided context snippets.
If context does not contain enough information, clearly say you do not have enough indexed context.
Keep answers concise and practical.`;
