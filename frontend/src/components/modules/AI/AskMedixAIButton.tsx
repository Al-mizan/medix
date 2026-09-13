"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MedixAIChatSheet } from "./MedixAIChatSheet";

export function AskMedixAIButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="group relative flex size-14 items-center justify-center rounded-full bg-[#5B4FCF] text-white shadow-[0_4px_20px_rgba(91,79,207,0.45)] transition-all duration-300 hover:scale-105 hover:bg-[#4A3FB8] hover:shadow-[0_6px_25px_rgba(91,79,207,0.6)] active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5B4FCF]/50 cursor-pointer"
                aria-label="Ask Medix AI"
              >
                {/* Glowing ring aura */}
                <span className="absolute -inset-1 -z-10 rounded-full bg-[#5B4FCF]/35 blur-md transition-all duration-500 group-hover:bg-[#5B4FCF]/60 group-hover:blur-lg animate-pulse" />

                {/* Sparkles icon */}
                <Sparkles className="size-6 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              sideOffset={12}
              className="bg-foreground text-background text-xs font-medium shadow-md"
            >
              <p>Ask Medix AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <MedixAIChatSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

export default AskMedixAIButton;
