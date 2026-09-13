"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  HelpCircle,
  FileQuestion,
  CalendarCheck2,
  Stethoscope,
  Info,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryRAG } from "@/services/rag.services";
import { IChatMessage } from "@/types/rag.types";
import { ChatMessage } from "./ChatMessage";
import { toast } from "sonner";

interface MedixAIChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MEDICAL_PROMPT_STARTERS = [
  {
    icon: FileQuestion,
    text: "What questions should I ask during consultation?",
    category: "Consultation",
  },
  {
    icon: HelpCircle,
    text: "Help me understand prescription terms",
    category: "Prescriptions",
  },
  {
    icon: CalendarCheck2,
    text: "How do I book an appointment?",
    category: "Booking",
  },
  {
    icon: Stethoscope,
    text: "What specialties are available for heart conditions?",
    category: "Specialties",
  },
];

export function MedixAIChatSheet({ open, onOpenChange }: MedixAIChatSheetProps) {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        scrollToBottom();
        textareaRef.current?.focus();
      }, 150);
    }
  }, [open, messages]);

  const queryMutation = useMutation({
    mutationFn: async (queryText: string) => {
      return await queryRAG({
        query: queryText,
        topK: 5,
        minSimilarity: 0.2,
      });
    },
    onSuccess: (res) => {
      const responseData = res.data;
      const assistantMessage: IChatMessage = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        role: "assistant",
        content:
          responseData?.answer ||
          "I couldn't retrieve an exact answer from our clinical knowledge base. Please feel free to ask another question or consult a verified doctor directly.",
        citations: responseData?.citations || [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error: unknown) => {
      const err = error as { message?: string; response?: { data?: { message?: string } } } | undefined;
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Medix AI service is temporarily unavailable. Please try again.";
      toast.error(errorMsg);

      const fallbackMessage: IChatMessage = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        role: "assistant",
        content:
          "I apologize, but I encountered an error retrieving information from the clinical knowledge base. Please check your connection or try again in a moment.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    },
  });

  const handleSend = (textToSend?: string) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || queryMutation.isPending) return;

    const userMessage: IChatMessage = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    queryMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full sm:max-w-md md:max-w-lg flex-col gap-0 p-0 border-l border-border bg-background shadow-2xl"
      >
        {/* Assist Violet Accent Top Bar */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#5B4FCF] via-[#7B70E0] to-[#5B4FCF]" />

        {/* Sheet Header */}
        <SheetHeader className="border-b border-border/80 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#5B4FCF] text-white shadow-xs shadow-[#5B4FCF]/30">
                <Sparkles className="size-4.5" />
              </div>
              <div className="flex flex-col text-left">
                <SheetTitle className="text-base font-bold text-foreground">
                  Medix AI Assistant
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Clinical intelligence powered by Medix RAG
                </SheetDescription>
              </div>
            </div>

            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-[#5B4FCF]/10 mr-6"
                title="Clear conversation"
              >
                <RotateCcw className="size-3.5 text-[#5B4FCF]" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col justify-center py-6 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#ECEAFB] text-[#5B4FCF] ring-8 ring-[#5B4FCF]/10 dark:bg-[#2B2467]/60 dark:text-[#DAD6FA]">
                <Bot className="size-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                How can I assist you today?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                Ask anything about consultations, medications, doctor specialties, or platform guidance.
              </p>

              {/* Prompt Starters */}
              <div className="mt-6 grid grid-cols-1 gap-2.5 text-left">
                {MEDICAL_PROMPT_STARTERS.map((starter) => {
                  const Icon = starter.icon;
                  return (
                    <button
                      key={starter.text}
                      type="button"
                      onClick={() => handleSend(starter.text)}
                      className="group flex items-start gap-3 rounded-xl border border-border/80 bg-surface/60 p-3 transition-all hover:border-[#5B4FCF]/40 hover:bg-[#ECEAFB]/50 hover:shadow-xs dark:hover:bg-[#2B2467]/30"
                    >
                      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#5B4FCF]/10 text-[#5B4FCF] group-hover:bg-[#5B4FCF] group-hover:text-white transition-colors dark:bg-[#5B4FCF]/20 dark:text-[#DAD6FA]">
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-foreground group-hover:text-[#5B4FCF] dark:group-hover:text-[#DAD6FA] transition-colors">
                          {starter.text}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                          {starter.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, index) => (
                <ChatMessage key={msg.id || index} message={msg} />
              ))}

              {/* In-Flight Typing Indicator */}
              {queryMutation.isPending && (
                <div className="flex justify-start gap-2.5 my-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#5B4FCF] text-white shadow-xs mt-0.5">
                    <Sparkles className="size-3.5 animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-tl-xs border border-[#5B4FCF]/20 bg-[#ECEAFB] px-4 py-3 text-[#3E3595] shadow-xs dark:border-[#7B70E0]/30 dark:bg-[#2B2467]/50 dark:text-[#DAD6FA] max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-[#5B4FCF] animate-bounce [animation-delay:-0.3s]" />
                        <span className="size-1.5 rounded-full bg-[#5B4FCF] animate-bounce [animation-delay:-0.15s]" />
                        <span className="size-1.5 rounded-full bg-[#5B4FCF] animate-bounce" />
                      </div>
                      <span className="text-xs font-medium text-[#5B4FCF] dark:text-[#DAD6FA]">
                        Synthesizing medical knowledge...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input & Footer Area */}
        <div className="border-t border-border/80 bg-background/95 p-4 backdrop-blur-sm">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-xs focus-within:border-[#5B4FCF] focus-within:ring-2 focus-within:ring-[#5B4FCF]/20 transition-all">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a medical question or platform help..."
              rows={1}
              disabled={queryMutation.isPending}
              className="min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent px-2 py-1.5 text-sm shadow-none focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              size="icon"
              disabled={!input.trim() || queryMutation.isPending}
              onClick={() => handleSend()}
              className="size-8 shrink-0 rounded-xl bg-[#5B4FCF] text-white hover:bg-[#4A3FB8] disabled:opacity-30 transition-all shadow-xs"
              aria-label="Send query"
            >
              <Send className="size-4" />
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
            <Info className="size-3 text-[#5B4FCF] shrink-0" />
            <span>Medix AI provides guidance. For emergencies, contact your emergency provider.</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
