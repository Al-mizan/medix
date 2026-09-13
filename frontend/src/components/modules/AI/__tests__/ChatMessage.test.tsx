import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ChatMessage } from "../ChatMessage";
import { IChatMessage } from "@/types/rag.types";

describe("ChatMessage Component", () => {
  it("renders a user message correctly", () => {
    const userMsg: IChatMessage = {
      role: "user",
      content: "Can I reschedule my appointment?",
    };

    render(<ChatMessage message={userMsg} />);

    expect(screen.getByText("Can I reschedule my appointment?")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("renders an assistant message with markdown and Verified RAG badge", () => {
    const aiMsg: IChatMessage = {
      role: "assistant",
      content: "Yes, you can **reschedule** appointments up to 24 hours in advance.\n\n- Visit Dashboard\n- Select Appointment",
    };

    render(<ChatMessage message={aiMsg} />);

    expect(screen.getByText("Medix AI")).toBeInTheDocument();
    expect(screen.getByText("Verified RAG")).toBeInTheDocument();
    expect(screen.getByText("reschedule")).toBeInTheDocument();
    expect(screen.getByText("Visit Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Select Appointment")).toBeInTheDocument();
  });

  it("renders citation cards when citations are provided", () => {
    const aiMsgWithCitations: IChatMessage = {
      role: "assistant",
      content: "Cardiology consultations are available daily.",
      citations: [
        {
          sourceType: "doctor",
          sourceId: "doc-123",
          sourceLabel: "Dr. Sarah Jenkins",
          similarity: 0.89,
          snippet: "Available for cardiology consultations Monday through Friday.",
          metadata: null,
        },
      ],
    };

    render(<ChatMessage message={aiMsgWithCitations} />);

    expect(screen.getByText(/Sources & Citations/)).toBeInTheDocument();
    expect(screen.getByText("Dr. Sarah Jenkins")).toBeInTheDocument();
    expect(screen.getByText("89% match")).toBeInTheDocument();
    expect(
      screen.getByText(
        /[“"]Available for cardiology consultations Monday through Friday\.[”"]/
      )
    ).toBeInTheDocument();
  });
});
