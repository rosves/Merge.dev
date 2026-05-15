import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// liste des conversations
router.get("/conversations", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user!.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
      },
      include: {
        sender: { select: { id: true, username: true, role: true } },
        receiver: { select: { id: true, username: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const conversationsMap = new Map<number, any>();
    for (const msg of messages) {
      const otherId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender;

      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (msg.receiverId === currentUserId && !msg.read) {
        const conv = conversationsMap.get(otherId)!;
        conv.unreadCount++;
      }
    }

    return res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    console.error("Erreur GET /messages/conversations:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// marquer les messages d'un expéditeur comme lus
router.patch("/:userId/read", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const otherUserId = parseInt(req.params.userId as string);
    const currentUserId = req.user!.id;

    await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: currentUserId, read: false },
      data: { read: true },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Erreur PATCH /messages/:userId/read:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// historique canal groupe
router.get("/group/history", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role === "USER") {
      return res.status(403).json({ error: "Accès réservé aux modérateurs et admins" });
    }

    const messages = await prisma.groupMessage.findMany({
      include: {
        sender: { select: { id: true, username: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json(messages);
  } catch (error) {
    console.error("Erreur GET /messages/group/history:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// historique conversation avec un user 
router.get("/:userId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const otherUserId = parseInt(req.params.userId as string);
    const currentUserId = req.user!.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      include: {
        sender: { select: { id: true, username: true, role: true } },
        receiver: { select: { id: true, username: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json(messages);
  } catch (error) {
    console.error("Erreur GET /messages/:userId:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;