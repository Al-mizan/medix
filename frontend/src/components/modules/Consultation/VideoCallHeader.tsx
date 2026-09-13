import React from "react"
import { Clock, ShieldCheck, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VideoCallHeaderProps {
  otherParticipantName: string
  connectionStatus: "initializing" | "waiting-peer" | "connecting" | "in-call" | "error" | "ended"
  elapsedSeconds: number
}

const formatTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function VideoCallHeader({
  otherParticipantName,
  connectionStatus,
  elapsedSeconds,
}: VideoCallHeaderProps) {
  return (
    <header className="relative z-10 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0B7285] to-[#178A5E] shadow-sm">
          <Sparkles className="size-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-wide text-zinc-100">
              Teleconsultation Session
            </span>
            <Badge
              variant="outline"
              className={
                connectionStatus === "in-call"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs py-0"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs py-0"
              }
            >
              {connectionStatus === "in-call" ? "Connected" : "Waiting for Peer"}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">
            With {otherParticipantName}
          </p>
        </div>
      </div>

      {/* Live Call Duration */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-800/70 px-3 py-1 text-xs font-mono text-zinc-300">
          <Clock className="size-3.5 text-zinc-400" />
          <span>{formatTimer(elapsedSeconds)}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>End-to-End P2P Encrypted</span>
        </div>
      </div>
    </header>
  )
}
