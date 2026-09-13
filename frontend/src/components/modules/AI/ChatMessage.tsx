"use client";

import React, { useState } from "react";
import {
  Bot,
  User,
  Sparkles,
  BookOpen,
  Stethoscope,
  Activity,
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import { IChatMessage, IRagCitation } from "@/types/rag.types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: IChatMessage;
}

function getSourceIcon(sourceType: string) {
  const lower = sourceType.toLowerCase();
  if (lower.includes("doctor") || lower.includes("physician")) {
    return <Stethoscope className="size-3.5 text-[#5B4FCF] shrink-0" />;
  }
  if (lower.includes("specialty") || lower.includes("service")) {
    return <Activity className="size-3.5 text-[#5B4FCF] shrink-0" />;
  }
  if (lower.includes("guide") || lower.includes("faq") || lower.includes("doc")) {
    return <BookOpen className="size-3.5 text-[#5B4FCF] shrink-0" />;
  }
  return <FileText className="size-3.5 text-[#5B4FCF] shrink-0" />;
}

function CitationCard({ citation }: { citation: IRagCitation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scorePct = Math.round(
    citation.similarity <= 1 ? citation.similarity * 100 : citation.similarity
  );

  const label =
    citation.sourceLabel ||
    (citation.sourceType
      ? citation.sourceType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Clinical Source");

  return (
    <div className="rounded-lg border border-[#5B4FCF]/20 bg-surface/80 p-2.5 shadow-xs transition-all dark:bg-[#141C24]/80">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {getSourceIcon(citation.sourceType)}
          <span className="truncate text-xs font-semibold text-foreground" title={label}>
            {label}
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-[#5B4FCF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5B4FCF] dark:bg-[#5B4FCF]/25 dark:text-[#DAD6FA]">
          {scorePct}% match
        </span>
      </div>

      {citation.snippet && (
        <div className="mt-1.5">
          <p
            className={cn(
              "text-xs leading-relaxed text-muted-foreground",
              !isExpanded && "line-clamp-2"
            )}
          >
            &ldquo;{citation.snippet}&rdquo;
          </p>
          {citation.snippet.length > 120 && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#5B4FCF] hover:underline dark:text-[#9B91F8]"
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp className="size-3" />
                </>
              ) : (
                <>
                  Show snippet <ChevronDown className="size-3" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 my-3">
        <div className="flex flex-col items-end max-w-[85%]">
          <div className="rounded-2xl rounded-tr-xs border border-border bg-surface px-4 py-2.5 text-sm text-foreground shadow-xs">
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
          <span className="mt-1 text-[10px] text-muted-foreground px-1">You</span>
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground mt-0.5">
          <User className="size-3.5" />
        </div>
      </div>
    );
  }

  // Assistant message
  const hasCitations = Boolean(message.citations && message.citations.length > 0);

  return (
    <div className="flex justify-start gap-2.5 my-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#5B4FCF] text-white shadow-xs mt-0.5">
        <Sparkles className="size-3.5" />
      </div>

      <div className="flex flex-col max-w-[88%] sm:max-w-[85%]">
        <div className="rounded-2xl rounded-tl-xs border border-[#5B4FCF]/20 bg-[#ECEAFB] p-4 text-[#3E3595] shadow-xs dark:border-[#7B70E0]/30 dark:bg-[#2B2467]/50 dark:text-[#DAD6FA]">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between border-b border-[#5B4FCF]/15 pb-1.5 dark:border-[#7B70E0]/20">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#5B4FCF] dark:text-[#DAD6FA]">
                Medix AI
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-md bg-[#5B4FCF]/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#5B4FCF] uppercase dark:bg-[#5B4FCF]/30 dark:text-[#DAD6FA]">
                <ShieldCheck className="size-2.5" />
                Verified RAG
              </span>
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <MarkdownRenderer content={message.content} />

          {/* Citation Cards */}
          {hasCitations && message.citations && (
            <div className="mt-3.5 border-t border-[#5B4FCF]/15 pt-3 dark:border-[#7B70E0]/20">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#5B4FCF] dark:text-[#DAD6FA]">
                <BookOpen className="size-3.5" />
                <span>Sources & Citations ({message.citations.length})</span>
              </div>
              <div className="space-y-2">
                {message.citations.map((citation, idx) => (
                  <CitationCard key={`${citation.sourceId}-${idx}`} citation={citation} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
