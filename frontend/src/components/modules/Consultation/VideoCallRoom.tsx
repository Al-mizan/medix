"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { toast } from "sonner"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  User,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  LayoutDashboard,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { IAppointment } from "@/types/appointment.types"

interface VideoCallRoomProps {
  appointment: IAppointment
  token: string
  currentUserRole: string
  currentUserId?: string
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
}

export default function VideoCallRoom({
  appointment,
  token,
  currentUserRole,
  currentUserId,
}: VideoCallRoomProps) {
  const router = useRouter()
  const videoCallingId = appointment.videoCallingId || ""

  // Media & WebRTC references
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const isInitiatorRef = useRef(false)
  const queuedCandidatesRef = useRef<RTCIceCandidateInit[]>([])

  // Component states
  const [connectionStatus, setConnectionStatus] = useState<
    "initializing" | "waiting-peer" | "connecting" | "in-call" | "error" | "ended"
  >("initializing")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isPeerMicMuted, setIsPeerMicMuted] = useState(false)
  const [isPeerVideoOff, setIsPeerVideoOff] = useState(false)
  const [peerName, setPeerName] = useState<string>("")
  const [peerRole, setPeerRole] = useState<string>("")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showDoctorEndDialog, setShowDoctorEndDialog] = useState(false)

  const isDoctor = currentUserRole === "DOCTOR"
  const isPatient = currentUserRole === "PATIENT"

  const otherParticipantName = isDoctor
    ? appointment.patient?.name || "Patient"
    : appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : "Doctor"

  const otherParticipantPhoto = isDoctor
    ? appointment.patient?.profilePhoto
    : appointment.doctor?.profilePhoto

  // Call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (connectionStatus === "in-call") {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [connectionStatus])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Create & configure RTCPeerConnection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current
    }

    const pc = new RTCPeerConnection(ICE_SERVERS)
    peerConnectionRef.current = pc

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    // Handle remote track received
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0]
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
        setConnectionStatus("in-call")
      }
    }

    // Handle ICE candidates generated locally
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && videoCallingId) {
        socketRef.current.emit("ice-candidate", {
          videoCallingId,
          candidate: event.candidate,
        })
      }
    }

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "closed"
      ) {
        if (connectionStatus === "in-call") {
          setConnectionStatus("waiting-peer")
        }
      }
    }

    return pc
  }, [videoCallingId, connectionStatus])

  // Setup media and Socket.IO
  useEffect(() => {
    let active = true

    const setupMediaAndSocket = async () => {
      try {
        // 1. Get user media (camera & microphone)
        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          })
        } catch (mediaErr) {
          console.warn("Could not get both video and audio, trying audio-only fallback:", mediaErr)
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            setIsVideoOff(true)
          } catch {
            setErrorMessage(
              "Unable to access camera or microphone. Please check your browser device permissions and reload."
            )
            setConnectionStatus("error")
            return
          }
        }

        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // 2. Resolve Socket Server URL
        const socketUrl =
          process.env.NEXT_PUBLIC_SOCKET_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ||
          "http://localhost:5000"

        const socket = io(socketUrl, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnectionAttempts: 5,
        })
        socketRef.current = socket

        // 3. Socket event handlers
        socket.on("connect", () => {
          socket.emit("join-room", { videoCallingId })
        })

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err)
          setErrorMessage(`Connection failed: ${err.message || "Failed to connect to signaling server."}`)
          setConnectionStatus("error")
        })

        socket.on("call-error", (err: { code: string; message: string }) => {
          console.error("Call error from server:", err)
          setErrorMessage(err.message)
          setConnectionStatus("error")
          toast.error(err.message)
        })

        socket.on("room-created", () => {
          isInitiatorRef.current = true
          setConnectionStatus("waiting-peer")
        })

        socket.on("room-joined", (data: { role?: string; name?: string }) => {
          isInitiatorRef.current = false
          setConnectionStatus("waiting-peer")
          if (data?.name) {
            setPeerName(data.name)
            setPeerRole(data.role || "")
          }
        })

        socket.on("peer-ready", async (data: { userId?: string; role?: string; name?: string }) => {
          if (data?.name) {
            setPeerName(data.name)
            setPeerRole(data.role || "")
          }
          toast.success(`${data?.name || "Participant"} joined the call`)

          // If initiator, create and send WebRTC offer
          if (isInitiatorRef.current) {
            setConnectionStatus("connecting")
            const pc = createPeerConnection()
            try {
              const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
              })
              await pc.setLocalDescription(offer)
              socket.emit("offer", { videoCallingId, sdp: offer })
            } catch (offerErr) {
              console.error("Error creating WebRTC offer:", offerErr)
            }
          }
        })

        socket.on("offer", async (payload: { sdp: RTCSessionDescriptionInit }) => {
          if (!payload?.sdp) return
          setConnectionStatus("connecting")
          const pc = createPeerConnection()
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))

            // Drain queued ICE candidates
            while (queuedCandidatesRef.current.length > 0) {
              const cand = queuedCandidatesRef.current.shift()
              if (cand) {
                await pc.addIceCandidate(new RTCIceCandidate(cand))
              }
            }

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socket.emit("answer", { videoCallingId, sdp: answer })
          } catch (answerErr) {
            console.error("Error responding to offer:", answerErr)
          }
        })

        socket.on("answer", async (payload: { sdp: RTCSessionDescriptionInit }) => {
          if (!payload?.sdp) return
          const pc = peerConnectionRef.current
          if (pc) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))

              // Drain queued ICE candidates
              while (queuedCandidatesRef.current.length > 0) {
                const cand = queuedCandidatesRef.current.shift()
                if (cand) {
                  await pc.addIceCandidate(new RTCIceCandidate(cand))
                }
              }
            } catch (err) {
              console.error("Error setting remote answer:", err)
            }
          }
        })

        socket.on("ice-candidate", async (payload: { candidate: RTCIceCandidateInit }) => {
          if (!payload?.candidate) return
          const pc = peerConnectionRef.current
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
            } catch (iceErr) {
              console.error("Error adding received ICE candidate:", iceErr)
            }
          } else {
            queuedCandidatesRef.current.push(payload.candidate)
          }
        })

        socket.on(
          "peer-media-toggle",
          (payload: { mediaType: "audio" | "video"; enabled: boolean }) => {
            if (payload.mediaType === "audio") {
              setIsPeerMicMuted(!payload.enabled)
            } else if (payload.mediaType === "video") {
              setIsPeerVideoOff(!payload.enabled)
            }
          }
        )

        socket.on("peer-left", (data: { name?: string }) => {
          toast.info(`${data?.name || "Participant"} left the consultation.`)
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null
          }
          remoteStreamRef.current = null
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
          }
          setConnectionStatus("waiting-peer")
        })
      } catch (err: unknown) {
        console.error("Setup error in VideoCallRoom:", err)
        setErrorMessage("An unexpected error occurred while setting up the consultation.")
        setConnectionStatus("error")
      }
    }

    void setupMediaAndSocket()

    return () => {
      active = false
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
        localStreamRef.current = null
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      if (socketRef.current) {
        socketRef.current.emit("leave-call", { videoCallingId })
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [videoCallingId, token, createPeerConnection])

  // Toggle Microphone
  const handleToggleMic = () => {
    if (!localStreamRef.current) return
    const audioTrack = localStreamRef.current.getAudioTracks()[0]
    if (audioTrack) {
      const nextState = !isMicMuted
      audioTrack.enabled = !nextState
      setIsMicMuted(nextState)
      if (socketRef.current) {
        socketRef.current.emit("toggle-media", {
          videoCallingId,
          mediaType: "audio",
          enabled: !nextState,
        })
      }
    }
  }

  // Toggle Camera
  const handleToggleVideo = () => {
    if (!localStreamRef.current) return
    const videoTrack = localStreamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      const nextState = !isVideoOff
      videoTrack.enabled = !nextState
      setIsVideoOff(nextState)
      if (socketRef.current) {
        socketRef.current.emit("toggle-media", {
          videoCallingId,
          mediaType: "video",
          enabled: !nextState,
        })
      }
    }
  }

  // Terminate call flow
  const handleEndCall = () => {
    // 1. Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    // 2. Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    // 3. Emit leave and disconnect socket
    if (socketRef.current) {
      socketRef.current.emit("leave-call", { videoCallingId })
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setConnectionStatus("ended")

    // If doctor, offer prescription dialog
    if (isDoctor) {
      setShowDoctorEndDialog(true)
    } else if (isPatient) {
      toast.success("Consultation ended.")
      router.push("/dashboard/my-appointments")
    } else {
      router.push("/admin/dashboard/appointments-management")
    }
  }

  // Render Error View
  if (connectionStatus === "error") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/20 bg-background shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Unable to Join Consultation
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {errorMessage || "The consultation room could not be accessed."}
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full gap-2"
              >
                <RefreshCw className="size-4" />
                Retry Connection
              </Button>
              <Button
                onClick={() => {
                  if (isDoctor) router.push("/doctor/dashboard/appointments")
                  else if (isPatient) router.push("/dashboard/my-appointments")
                  else router.push("/admin/dashboard/appointments-management")
                }}
                className="w-full bg-[#0B7285] hover:bg-[#095E70] text-white"
              >
                <LayoutDashboard className="mr-2 size-4" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-zinc-950 text-white select-none">
      {/* Top Header Bar */}
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

      {/* Main Video Arena */}
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

      {/* Floating Bottom Controls Dock */}
      <footer className="relative z-10 flex h-20 items-center justify-center gap-3 border-t border-zinc-800/80 bg-zinc-900/80 px-4 backdrop-blur-md sm:gap-4">
        {/* Toggle Mic */}
        <Button
          type="button"
          size="icon"
          onClick={handleToggleMic}
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
          onClick={handleToggleVideo}
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
          onClick={handleEndCall}
          className="size-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-transform active:scale-95"
          title="End Consultation"
        >
          <PhoneOff className="size-5" />
        </Button>
      </footer>

      {/* Doctor Post-Consultation Prescription Modal */}
      <Dialog open={showDoctorEndDialog} onOpenChange={setShowDoctorEndDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-[#0B7285]" />
              Consultation Concluded
            </DialogTitle>
            <DialogDescription>
              The video consultation with {appointment.patient?.name || "the patient"} has ended. Would you like to issue a digital prescription for this appointment now?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
            <p><strong>Appointment ID:</strong> {appointment.id}</p>
            <p><strong>Patient:</strong> {appointment.patient?.name || "N/A"}</p>
            <p><strong>Call Duration:</strong> {formatTimer(elapsedSeconds)}</p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDoctorEndDialog(false)
                router.push("/doctor/dashboard/appointments")
              }}
            >
              Back to Appointments
            </Button>
            <Button
              className="bg-[#0B7285] hover:bg-[#095E70] text-white gap-1.5"
              onClick={() => {
                setShowDoctorEndDialog(false)
                router.push(`/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`)
              }}
            >
              <FileText className="size-4" />
              Create Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
