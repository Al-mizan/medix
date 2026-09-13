# [TICK-018] RAG AI Chat Interface (Floating Violet Drawer)

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-009
- **Blocks**: None

---

## Objective

Build a floating "Ask Medix AI" button that opens a Sheet/Drawer with a chat interface, accessible from any dashboard page for any authenticated role. The backend RAG pipeline is fully operational at `POST /api/v1/rag/query`. The UI must use the Assist Violet (`#5B4FCF`) color exclusively for all AI-related elements as specified in `frontend_color_palate.md`.

---

## Detailed Tasks

### 1. Floating AI Button
- Create `src/components/modules/AI/AskMedixAIButton.tsx`:
  - Fixed-position button at bottom-right of viewport.
  - Circular button with Lucide `Bot` or `Sparkles` icon.
  - Background: Assist Violet `#5B4FCF`, hover: `#4A3FB8`.
  - Text: "Ask Medix AI" tooltip on hover.
  - Clicking opens the chat Sheet.
- Mount this component in the dashboard layout so it appears on ALL dashboard pages (admin, doctor, patient).

### 2. Chat Sheet/Drawer
- Create `src/components/modules/AI/MedixAIChatSheet.tsx`:
  - Use shadcn/ui `Sheet` component (slide-in from right).
  - Width: ~400px on desktop, full-width on mobile.
  - Header: "Medix AI Assistant" with Assist Violet accent bar.
  - Message area: Scrollable container for chat history.
  - Input area: Text input + send button at bottom.

### 3. Chat Message Components
- Create `src/components/modules/AI/ChatMessage.tsx`:
  - **User messages**: Right-aligned, neutral background.
  - **AI messages**: Left-aligned, Assist Violet tint background (`#ECEAFB`), tint text (`#3E3595`).
  - AI messages display:
    - Answer text (rendered as markdown).
    - **Citation cards**: If the RAG response includes source references, render them as small linked cards showing source label and relevance score.
- Messages are stored in local React state (no persistence needed for MVP).

### 4. Query Integration
- Create service: `queryRAG(payload)` → `POST /api/v1/rag/query` with `{ query, topK: 5, minSimilarity: 0.2 }`.
- Use TanStack Query `useMutation` for the query call.
- Show loading spinner/skeleton while waiting for response.
- Handle errors gracefully (show error toast if RAG service is unavailable).

### 5. Conversation UX
- Maintain conversation history in local state as `{ role: "user" | "assistant", content: string, citations?: Citation[] }[]`.
- Clear conversation button in Sheet header.
- Auto-scroll to latest message.
- Disable send button while query is in-flight.

---

## Verification

- Floating violet button visible on all dashboard pages (admin, doctor, patient).
- Clicking opens Sheet with chat interface.
- Type a medical question → response appears with AI styling.
- Citations render as linked cards when available.
- Chat history maintained within session.
- Clear button resets conversation.
- `pnpm build` succeeds.
