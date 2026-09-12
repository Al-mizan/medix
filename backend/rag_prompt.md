Analyze this RAG implementation deeply.

For every major component explain:

1. The intuition behind it
   - What problem is this solving?
   - Why was this component introduced?

2. Why this design?
   - Why was it implemented this way?
   - What alternative approaches exist?
   - Why might those alternatives not have been chosen?

3. Data flow
   - Trace the complete flow from user query to final response.
   - Show step-by-step how data moves through the system.

4. Architecture
   - Explain how each file, class, function, and service interacts.
   - Create a mental model of the whole system.

5. Retrieval pipeline
   - Chunking strategy
   - Embedding generation
   - Vector search
   - Reranking (if any)
   - Context construction
   - LLM generation

6. Design tradeoffs
   - Pros and cons of current implementation.
   - Scalability concerns.
   - Performance bottlenecks.

7. Improvements
   - What would you change if this had to serve 10x more users?
   - Best-practice recommendations.

8. ELI5 section
   - Explain the entire RAG pipeline using a simple real-world analogy.

Don't just describe the code. Explain the engineering reasoning and decision-making behind it.


Teach me like a senior engineer mentoring a junior developer.
Assume I want to understand the concepts deeply, not just read the code.
Use diagrams, examples, and analogies whenever helpful.