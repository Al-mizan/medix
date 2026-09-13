import { Server as SocketIOServer, Socket } from "socket.io";
import { AppointmentStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AuthenticatedSocketUser } from "../../lib/socket";

export interface JoinRoomPayload {
    videoCallingId: string;
}

export interface SignalingPayload {
    videoCallingId: string;
    sdp?: unknown;
    candidate?: unknown;
}

export interface MediaTogglePayload {
    videoCallingId: string;
    mediaType: "audio" | "video";
    enabled: boolean;
}

export const registerVideoCallSocketHandlers = (io: SocketIOServer, socket: Socket) => {
    const user = socket.data.user as AuthenticatedSocketUser | undefined;

    socket.on("join-room", async (payload: JoinRoomPayload) => {
        try {
            if (!user) {
                socket.emit("call-error", { code: "UNAUTHORIZED", message: "User not authenticated." });
                return;
            }

            const { videoCallingId } = payload;
            if (!videoCallingId) {
                socket.emit("call-error", { code: "INVALID_ROOM", message: "Video calling ID is required." });
                return;
            }

            const appointment = await prisma.appointment.findUnique({
                where: { videoCallingId },
                include: {
                    doctor: {
                        select: {
                            id: true,
                            userId: true,
                            email: true,
                            name: true,
                        },
                    },
                    patient: {
                        select: {
                            id: true,
                            userId: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            if (!appointment) {
                socket.emit("call-error", { code: "NOT_FOUND", message: "Consultation appointment not found." });
                return;
            }

            const isDoctor = appointment.doctor?.userId === user.userId || appointment.doctor?.email === user.email;
            const isPatient = appointment.patient?.userId === user.userId || appointment.patient?.email === user.email;
            const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

            if (!isDoctor && !isPatient && !isAdmin) {
                socket.emit("call-error", {
                    code: "FORBIDDEN",
                    message: "Forbidden: You are not a participant in this consultation.",
                });
                return;
            }

            // Enforce agreed strict preconditions: status must be INPROGRESS, payment must be PAID
            if (appointment.status !== AppointmentStatus.INPROGRESS) {
                socket.emit("call-error", {
                    code: "NOT_IN_PROGRESS",
                    message: isDoctor
                        ? "Please change the appointment status to 'In Progress' before starting the consultation."
                        : "The doctor has not started the consultation yet. Please wait until status is In Progress.",
                });
                return;
            }

            if (appointment.paymentStatus !== PaymentStatus.PAID) {
                socket.emit("call-error", {
                    code: "UNPAID",
                    message: "This consultation appointment is unpaid.",
                });
                return;
            }

            // Check room occupancy (P2P supports 2 participants)
            const room = io.sockets.adapter.rooms.get(videoCallingId);
            const numClients = room ? room.size : 0;

            if (numClients >= 2) {
                socket.emit("call-error", {
                    code: "ROOM_FULL",
                    message: "The consultation room already has two participants.",
                });
                return;
            }

            socket.join(videoCallingId);
            socket.data.videoCallingId = videoCallingId;
            socket.data.participantRole = isDoctor ? "doctor" : isPatient ? "patient" : "admin";
            socket.data.participantName = isDoctor ? appointment.doctor.name : appointment.patient.name;

            if (numClients === 0) {
                socket.emit("room-created", {
                    videoCallingId,
                    role: socket.data.participantRole,
                    name: socket.data.participantName,
                });
            } else {
                socket.emit("room-joined", {
                    videoCallingId,
                    role: socket.data.participantRole,
                    name: socket.data.participantName,
                });

                // Notify peers to begin WebRTC handshake
                io.to(videoCallingId).emit("peer-ready", {
                    userId: user.userId,
                    role: socket.data.participantRole,
                    name: socket.data.participantName,
                });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Internal signaling error";
            socket.emit("call-error", { code: "SERVER_ERROR", message });
        }
    });

    socket.on("offer", (payload: SignalingPayload) => {
        if (!payload.videoCallingId || !payload.sdp) return;
        socket.to(payload.videoCallingId).emit("offer", {
            sdp: payload.sdp,
            from: user?.userId,
        });
    });

    socket.on("answer", (payload: SignalingPayload) => {
        if (!payload.videoCallingId || !payload.sdp) return;
        socket.to(payload.videoCallingId).emit("answer", {
            sdp: payload.sdp,
            from: user?.userId,
        });
    });

    socket.on("ice-candidate", (payload: SignalingPayload) => {
        if (!payload.videoCallingId || !payload.candidate) return;
        socket.to(payload.videoCallingId).emit("ice-candidate", {
            candidate: payload.candidate,
            from: user?.userId,
        });
    });

    socket.on("toggle-media", (payload: MediaTogglePayload) => {
        if (!payload.videoCallingId) return;
        socket.to(payload.videoCallingId).emit("peer-media-toggle", {
            userId: user?.userId,
            mediaType: payload.mediaType,
            enabled: payload.enabled,
        });
    });

    socket.on("leave-call", (payload: { videoCallingId?: string }) => {
        const roomId = payload?.videoCallingId || socket.data.videoCallingId;
        if (roomId) {
            socket.to(roomId).emit("peer-left", {
                userId: user?.userId,
                name: socket.data.participantName,
            });
            socket.leave(roomId);
            delete socket.data.videoCallingId;
        }
    });

    socket.on("disconnect", () => {
        const roomId = socket.data.videoCallingId;
        if (roomId) {
            socket.to(roomId).emit("peer-left", {
                userId: user?.userId,
                name: socket.data.participantName,
            });
        }
    });
};
