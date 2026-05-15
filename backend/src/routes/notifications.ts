import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Récupérer les notifications de l'utilisateur connecté
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return res.json(notifications);
    } catch (error) {
        console.error("Erreur GET /notifications:", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// Marquer une notification comme lue
router.patch("/:id/read", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    
    // Gérer le cas où id est un tableau
    if (Array.isArray(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }
    
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: "ID invalide" });
    }
    
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Erreur PATCH /notifications/:id/read:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// Marquer les notifications NEW_MESSAGE d'un expéditeur comme lues
router.patch("/mark-sender-read/:senderId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.senderId;

if (Array.isArray(id)) {
  return res.status(400).json({ error: "ID invalide" });
}

const senderId = parseInt(id);
if (isNaN(senderId)) {
  return res.status(400).json({ error: "ID invalide" });
}
    
    const userId = req.user!.id;

    // Marquer toutes les notifications NEW_MESSAGE de ce sender comme lues
    await prisma.notification.updateMany({
      where: { 
        userId,
        type: "NEW_MESSAGE",
        // On suppose que le content contient le nom de l'expéditeur
        // Sinon il faudrait ajouter un champ senderId à la table Notification
      },
      data: { read: true },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Erreur PATCH /notifications/mark-sender-read:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// Marquer toutes les notifications comme lues
router.patch("/read-all", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Erreur PATCH /notifications/read-all:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;