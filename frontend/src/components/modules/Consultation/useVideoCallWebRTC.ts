import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { toast } from "sonner"

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
}

interface UseVideoCallWebRTCProps {
  token: string
  videoCallingId: string
}

export function useVideoCallWebRTC({ token, videoCallingId }: UseVideoCallWebRTCProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const isInitiatorRef = useRef(false)
  const queuedCandidatesRef = useRef<RTCIceCandidateInit[]>([])

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

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current
    }

    const pc = new RTCPeerConnection(ICE_SERVERS)
    peerConnectionRef.current = pc

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0]
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
        setConnectionStatus("in-call")
      }
    }

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

  useEffect(() => {
    let active = true

    const setupMediaAndSocket = async () => {
      try {
        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          })
        } catch (mediaErr) {
          console.warn("Audio-only fallback:", mediaErr)
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            setIsVideoOff(true)
          } catch {
            setErrorMessage(
              "Unable to access camera or microphone. Please check your browser permissions."
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

        socket.on("connect", () => {
          socket.emit("join-room", { videoCallingId })
        })

        socket.on("connect_error", (err) => {
          console.error("Socket error:", err)
          setErrorMessage(`Connection failed: ${err.message || "Failed to connect to signaling server."}`)
          setConnectionStatus("error")
        })

        socket.on("call-error", (err: { code: string; message: string }) => {
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
            console.error("Error answering offer:", answerErr)
          }
        })

        socket.on("answer", async (payload: { sdp: RTCSessionDescriptionInit }) => {
          if (!payload?.sdp) return
          const pc = peerConnectionRef.current
          if (pc) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))

              while (queuedCandidatesRef.current.length > 0) {
                const cand = queuedCandidatesRef.current.shift()
                if (cand) {
                  await pc.addIceCandidate(new RTCIceCandidate(cand))
                }
              }
            } catch (err) {
              console.error("Error setting answer:", err)
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
              console.error("Error adding candidate:", iceErr)
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

  const terminateMediaAndSocket = () => {
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
    setConnectionStatus("ended")
  }

  return {
    localVideoRef,
    remoteVideoRef,
    connectionStatus,
    errorMessage,
    isMicMuted,
    isVideoOff,
    isPeerMicMuted,
    isPeerVideoOff,
    peerName,
    peerRole,
    handleToggleMic,
    handleToggleVideo,
    terminateMediaAndSocket,
  }
}
