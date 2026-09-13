import React from "react"
import { MicOff, VideoOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface VideoCallArenaProps {
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  connectionStatus: "initializing" | "waiting-peer" | "connecting" | "in-call" | "error" | "ended"
  isPeerVideoOff: boolean
  isPeerMicMuted: boolean
  isVideoOff: boolean
  isMicMuted: boolean
  otherParticipantName: string
  otherParticipantPhoto?: string | null
}

export default function VideoCallArena({
  remoteVideoRef,
  localVideoRef,
  connectionStatus,
  isPeerVideoOff,
  isPeerMicMuted,
  isVideoOff,
  isMicMuted,
  otherParticipantName,
  otherParticipantPhoto,
}: VideoCallArenaProps) {
  return (
    <main className="relative flex-1 p-3 sm:p-4 md:p-6">
      <div className="relative size-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center shadow-2xl">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`size-full object-cover transition-opacity duration-300 ${
            connectionStatus === "in-call" && !isPeerVideoOff
              ? "opacity-100"
              : "opacity-0 absolute pointer-events-none"
          }`}
        />

        {/* Peer Camera Off State */}
        {connectionStatus === "in-call" && isPeerVideoOff && (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Avatar className="size-24 border-2 border-zinc-700 bg-zinc-800">
              <AvatarImage src={otherParticipantPhoto || ""} />
              <AvatarFallback className="text-2xl font-bold bg-zinc-800 text-zinc-300">
                {otherParticipantName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium text-zinc-200">{otherParticipantName}</p>
              <p className="text-xs text-zinc-500">Camera is currently paused</p>
            </div>
          </div>
        )}

        {/* Waiting for Peer Screen */}
        {connectionStatus !== "in-call" && connectionStatus !== "ended" && (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
            <div className="relative mb-4">
              <Avatar className="size-20 border-2 border-zinc-700 bg-zinc-800 shadow-lg">
                <AvatarImage src={otherParticipantPhoto || ""} />
                <AvatarFallback className="text-xl font-bold bg-zinc-800 text-zinc-300">
                  {otherParticipantName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -inset-2 rounded-full border border-[#0B7285]/40 animate-ping pointer-events-none" />
            </div>
            <h3 className="text-base font-semibold text-zinc-200">
              Waiting for {otherParticipantName} to join...
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              The consultation room is active. As soon as both participants connect, the video session will start automatically.
            </p>
          </div>
        )}

        {/* Remote Participant Label Overlay */}
        {connectionStatus === "in-call" && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg bg-zinc-950/70 px-2.5 py-1.5 backdrop-blur-sm border border-zinc-800/80">
            <span className="text-xs font-medium text-zinc-200">{otherParticipantName}</span>
            {isPeerMicMuted && (
              <span title="Muted">
                <MicOff className="size-3.5 text-rose-400" />
              </span>
            )}
          </div>
        )}

        {/* Picture-in-Picture Local Video (Bottom-Right Floating Box) */}
        <div className="absolute bottom-4 right-4 z-20 w-36 h-24 sm:w-48 sm:h-32 md:w-56 md:h-36 overflow-hidden rounded-xl border-2 border-zinc-700 bg-zinc-950 shadow-2xl transition-all">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`size-full object-cover scale-x-[-1] ${
              isVideoOff ? "hidden" : "block"
            }`}
          />
          {isVideoOff && (
            <div className="flex size-full flex-col items-center justify-center bg-zinc-900 text-zinc-400">
              <VideoOff className="size-5 mb-1" />
              <span className="text-[10px]">Camera Paused</span>
            </div>
          )}
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-zinc-950/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-200">
            <span>You</span>
            {isMicMuted && <MicOff className="size-2.5 text-rose-400" />}
          </div>
        </div>
      </div>
    </main>
  )
}
