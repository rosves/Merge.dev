import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { notificationEmitter } from "../sse/notifications";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-prod";

const userSockets = new Map<number, string>();

interface AuthenticatedSocket extends Socket {
  user?: { id: number; email: string; username: string; role: string };
}

export function setupSocket(io: Server) {
  // auth middleware pour verifier le jwt a la connexion
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Token manquant"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedSocket["user"];
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Token invalide"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const user = socket.user!;
    console.log(`${user.username} (${user.role}) connecte - socket ${socket.id}`);

    userSockets.set(user.id, socket.id);
    socket.join(`user_${user.id}`);

    // les modos et admins rejoignent le canal groupe automatiquement
    if (user.role === "MODERATOR" || user.role === "ADMIN") {
      socket.join("moderators-admins");
    }

    // message prive
    socket.on("private_message", async (data: { receiverId: number; content: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: user.id,
            receiverId: data.receiverId,
          },
          include: {
            sender: { select: { id: true, username: true, role: true } },
            receiver: { select: { id: true, username: true, role: true } },
          },
        });

        io.to(`user_${data.receiverId}`).emit("private_message", message);
        socket.emit("private_message", message);

        // sauvegarder la notification en DB puis émettre via SSE
        const notification = await prisma.notification.create({
          data: {
            type: "NEW_MESSAGE",
            content: `${user.username} vous a envoyé un message`,
            userId: data.receiverId,
          },
        });

        notificationEmitter.emit("notification", {
          userId: data.receiverId,
          notification,
        });
      } catch (error) {
        console.error("Erreur private_message:", error);
        socket.emit("error", { message: "Erreur lors de l'envoi du message" });
      }
    });

    socket.on("typing", (data: { receiverId: number }) => {
      io.to(`user_${data.receiverId}`).emit("typing", {
        userId: user.id,
        username: user.username,
      });
    });

    socket.on("stop_typing", (data: { receiverId: number }) => {
      io.to(`user_${data.receiverId}`).emit("stop_typing", {
        userId: user.id,
      });
    });

    // message groupe (modo/admin seulement)
    socket.on("group_message", async (data: { content: string }) => {
      if (user.role === "USER") {
        return socket.emit("error", { message: "Accès refusé au canal groupe" });
      }

      try {
        const message = await prisma.groupMessage.create({
          data: {
            content: data.content,
            senderId: user.id,
          },
          include: {
            sender: { select: { id: true, username: true, role: true } },
          },
        });

        io.to("moderators-admins").emit("group_message", message);
      } catch (error) {
        console.error("Erreur group_message:", error);
        socket.emit("error", { message: "Erreur lors de l'envoi du message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`${user.username} deconnecte`);
      userSockets.delete(user.id);
    });
  });
}
