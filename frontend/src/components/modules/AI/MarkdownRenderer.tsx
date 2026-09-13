"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function renderInlineText(text: string): React.ReactNode[] {
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-[#5B4FCF]/10 px-1.5 py-0.5 font-mono text-xs font-medium text-[#3E3595] dark:bg-[#5B4FCF]/25 dark:text-[#DAD6FA]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-inherit">
          {renderInlineText(part.slice(2, -2))}
        </strong>
      );
    }

    if (
      (part.startsWith("*") && part.endsWith("*") && part.length > 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length > 2)
    ) {
      return (
        <em key={index} className="italic text-inherit">
          {renderInlineText(part.slice(1, -1))}
        </em>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#5B4FCF] underline underline-offset-2 hover:text-[#4A3FB8] dark:text-[#9B91F8] dark:hover:text-[#DAD6FA]"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];

  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentQuote: string[] | null = null;
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "ul") {
        blocks.push(
          <ul key={`ul-${blocks.length}`} className="my-2 ml-4 list-disc space-y-1 marker:text-[#5B4FCF]">
            {currentList.items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {renderInlineText(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        blocks.push(
          <ol key={`ol-${blocks.length}`} className="my-2 ml-4 list-decimal space-y-1 marker:font-medium marker:text-[#5B4FCF]">
            {currentList.items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {renderInlineText(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  const flushQuote = () => {
    if (currentQuote && currentQuote.length > 0) {
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="my-2 rounded-r border-l-3 border-[#5B4FCF] bg-[#5B4FCF]/5 px-3 py-1.5 text-sm italic text-inherit dark:bg-[#5B4FCF]/10"
        >
          {currentQuote.map((q, i) => (
            <p key={i} className="leading-relaxed">
              {renderInlineText(q)}
            </p>
          ))}
        </blockquote>
      );
      currentQuote = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push(
          <div key={`code-${blocks.length}`} className="my-2 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-slate-100 dark:bg-slate-950">
            {codeBlockLang && (
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {codeBlockLang}
              </div>
            )}
            <pre>
              <code>{codeBlockLines.join("\n")}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = "";
      } else {
        flushList();
        flushQuote();
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushList();
      flushQuote();
      continue;
    }

    if (line.trim().startsWith(">")) {
      flushList();
      const quoteText = line.trim().replace(/^>\s?/, "");
      if (!currentQuote) currentQuote = [];
      currentQuote.push(quoteText);
      continue;
    } else {
      flushQuote();
    }

    if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="mt-3 mb-1 font-semibold text-sm text-[#3E3595] dark:text-[#DAD6FA]">
          {renderInlineText(line.slice(4))}
        </h3>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="mt-3.5 mb-1.5 font-bold text-base text-[#3E3595] dark:text-[#DAD6FA]">
          {renderInlineText(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h1 key={`h1-${blocks.length}`} className="mt-4 mb-2 font-bold text-lg text-[#3E3595] dark:text-[#DAD6FA]">
          {renderInlineText(line.slice(2))}
        </h1>
      );
      continue;
    }

    const ulMatch = line.match(/^(\s*)[*-]\s+(.+)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(ulMatch[2]);
      continue;
    }

    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    flushList();

    blocks.push(
      <p key={`p-${blocks.length}`} className="my-1.5 text-sm leading-relaxed">
        {renderInlineText(line)}
      </p>
    );
  }

  flushList();
  flushQuote();

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
}
