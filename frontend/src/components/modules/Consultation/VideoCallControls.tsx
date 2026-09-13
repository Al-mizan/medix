import React from "react"
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoCallControlsProps {
  isMicMuted: boolean
  isVideoOff: boolean
  onToggleMic: () => void
  onToggleVideo: () => void
  onEndCall: () => void
}

export default function VideoCallControls({
  isMicMuted,
  isVideoOff,
  onToggleMic,
  onToggleVideo,
  onEndCall,
}: VideoCallControlsProps) {
  return (
    <footer className="relative z-10 flex h-20 items-center justify-center gap-3 border-t border-zinc-800/80 bg-zinc-900/80 px-4 backdrop-blur-md sm:gap-4">
      {/* Toggle Mic */}
      <Button
        type="button"
        size="icon"
        onClick={onToggleMic}
        variant={isMicMuted ? "destructive" : "secondary"}
        className={`size-12 rounded-full shadow-lg transition-transform active:scale-95 ${
          isMicMuted
            ? "bg-rose-600 hover:bg-rose-700 text-white"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
        }`}
        title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
      >
        {isMicMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
      </Button>

      {/* Toggle Camera */}
      <Button
        type="button"
        size="icon"
        onClick={onToggleVideo}
        variant={isVideoOff ? "destructive" : "secondary"}
        className={`size-12 rounded-full shadow-lg transition-transform active:scale-95 ${
          isVideoOff
            ? "bg-rose-600 hover:bg-rose-700 text-white"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
        }`}
        title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
      >
        {isVideoOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
      </Button>

      {/* End Call Button */}
      <Button
        type="button"
        size="icon"
        onClick={onEndCall}
        className="size-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-transform active:scale-95"
        title="End Consultation"
      >
        <PhoneOff className="size-5" />
      </Button>
    </footer>
  )
}
