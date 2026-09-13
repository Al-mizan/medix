import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { prisma } from "./prisma";
import { jwtUtils } from "../utils/jwt";
import { registerVideoCallSocketHandlers } from "../module/videoCall/videoCall.socket";

export interface AuthenticatedSocketUser {
    userId: string;
    email: string;
    role: Role;
}

let io: SocketIOServer | null = null;

const parseCookie = (cookieStr: string, name: string): string | null => {
    const matches = cookieStr.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return matches ? decodeURIComponent(matches[1]) : null;
};

export const initSocketIO = (httpServer: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: [
                envVars.FRONTEND_URL,
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ],
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });

    // Handshake Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const authHeader = socket.handshake.headers?.authorization;
            const token =
                socket.handshake.auth?.token ||
                (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) ||
                parseCookie(socket.handshake.headers?.cookie || "", "accessToken");

            if (!token) {
                return next(new Error("Authentication error: No access token provided"));
            }

            const verified = jwtUtils.verifyToken(token, envVars.ACCESS_TOKEN_SECRET);
            if (!verified.success || !verified.data) {
                return next(new Error("Authentication error: Invalid or expired access token"));
            }

            const decoded = verified.data as { userId: string; email: string; role: Role };

            // Check if user exists and is active in DB
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, role: true, status: true, isDeleted: true },
            });

            if (!user || user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED || user.isDeleted) {
                return next(new Error("Authentication error: User account inactive or suspended"));
            }

            socket.data.user = {
                userId: user.id,
                email: user.email,
                role: user.role as Role,
            };

            next();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            next(new Error(`Authentication failed: ${message}`));
        }
    });

    io.on("connection", (socket) => {
        registerVideoCallSocketHandlers(io!, socket);
    });

    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized.");
    }
    return io;
};
