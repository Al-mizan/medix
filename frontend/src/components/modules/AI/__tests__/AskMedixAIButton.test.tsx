import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AskMedixAIButton } from "../AskMedixAIButton";

vi.mock("@/services/rag.services", () => ({
  queryRAG: vi.fn().mockResolvedValue({
    success: true,
    message: "Success",
    data: {
      answer: "Sample RAG answer",
      citations: [],
      retrieval: { totalMatches: 0 },
    },
  }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("AskMedixAIButton Component", () => {
  it("renders the floating button with accessible label and sparkles icon", () => {
    renderWithClient(<AskMedixAIButton />);

    const button = screen.getByRole("button", { name: "Ask Medix AI" });
    expect(button).toBeInTheDocument();
  });

  it("opens the Medix AI Sheet when clicked", () => {
    renderWithClient(<AskMedixAIButton />);

    const button = screen.getByRole("button", { name: "Ask Medix AI" });
    fireEvent.click(button);

    expect(screen.getByText("Medix AI Assistant")).toBeInTheDocument();
    expect(
      screen.getByText("Clinical intelligence powered by Medix RAG")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask a medical question or platform help...")
    ).toBeInTheDocument();
  });
});
