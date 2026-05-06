import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// historique conversation avec un user
router.get("/:userId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const otherUserId = parseInt(req.params.userId);
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

// liste des conversations
router.get("/conversations/list", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user!.id;

    // Trouver les users avec qui on a echange
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

    // conversations uniques avec dernier message
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

      // non lus
      if (msg.receiverId === currentUserId && !msg.read) {
        const conv = conversationsMap.get(otherId)!;
        conv.unreadCount++;
      }
    }

    return res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    console.error("Erreur GET /messages/conversations/list:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
