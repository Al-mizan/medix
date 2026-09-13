"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { IAppointment } from "@/types/appointment.types"
import VideoCallHeader from "./VideoCallHeader"
import VideoCallArena from "./VideoCallArena"
import VideoCallControls from "./VideoCallControls"
import VideoCallDoctorEndDialog from "./VideoCallDoctorEndDialog"
import VideoCallErrorCard from "./VideoCallErrorCard"
import { useVideoCallWebRTC } from "./useVideoCallWebRTC"

interface VideoCallRoomProps {
  appointment: IAppointment
  token: string
  currentUserRole: string
  currentUserId?: string
}

export default function VideoCallRoom({
  appointment,
  token,
  currentUserRole,
}: VideoCallRoomProps) {
  const router = useRouter()
  const videoCallingId = appointment.videoCallingId || ""

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

  const {
    localVideoRef,
    remoteVideoRef,
    connectionStatus,
    errorMessage,
    isMicMuted,
    isVideoOff,
    isPeerMicMuted,
    isPeerVideoOff,
    handleToggleMic,
    handleToggleVideo,
    terminateMediaAndSocket,
  } = useVideoCallWebRTC({ token, videoCallingId })

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

  const handleEndCall = () => {
    terminateMediaAndSocket()

    if (isDoctor) {
      setShowDoctorEndDialog(true)
    } else if (isPatient) {
      toast.success("Consultation ended.")
      router.push("/dashboard/my-appointments")
    } else {
      router.push("/admin/dashboard/appointments-management")
    }
  }

  if (connectionStatus === "error") {
    return (
      <VideoCallErrorCard
        errorMessage={errorMessage}
        isDoctor={isDoctor}
        isPatient={isPatient}
      />
    )
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-zinc-950 text-white select-none">
      <VideoCallHeader
        otherParticipantName={otherParticipantName}
        connectionStatus={connectionStatus}
        elapsedSeconds={elapsedSeconds}
      />

      <VideoCallArena
        remoteVideoRef={remoteVideoRef}
        localVideoRef={localVideoRef}
        connectionStatus={connectionStatus}
        isPeerVideoOff={isPeerVideoOff}
        isPeerMicMuted={isPeerMicMuted}
        isVideoOff={isVideoOff}
        isMicMuted={isMicMuted}
        otherParticipantName={otherParticipantName}
        otherParticipantPhoto={otherParticipantPhoto}
      />

      <VideoCallControls
        isMicMuted={isMicMuted}
        isVideoOff={isVideoOff}
        onToggleMic={handleToggleMic}
        onToggleVideo={handleToggleVideo}
        onEndCall={handleEndCall}
      />

      <VideoCallDoctorEndDialog
        open={showDoctorEndDialog}
        onOpenChange={setShowDoctorEndDialog}
        appointment={appointment}
        elapsedSeconds={elapsedSeconds}
      />
    </div>
  )
}
