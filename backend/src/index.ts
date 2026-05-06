import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import messagesRoutes from "./routes/messages";
import newsRoutes from "./routes/news";
import sseRoutes from "./sse/notifications";
import { setupSocket } from "./socket/chat";

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// rate limit global : 100 requetes / 15 min par IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requêtes, réessayez plus tard" },
});

// rate limit strict sur l'auth : 10 tentatives / 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives, réessayez plus tard" },
});

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(globalLimiter);

// Routes REST
app.use("/auth", authLimiter, authRoutes);
app.use("/users", usersRoutes);
app.use("/messages", messagesRoutes);
app.use("/news", newsRoutes);
app.use("/sse", sseRoutes);

// Route de test
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Setup WebSocket
setupSocket(io);

// Démarrage
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
