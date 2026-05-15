import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth";
import { newsEmitter, notificationEmitter } from "../sse/notifications";

const router = Router();
const prisma = new PrismaClient();

// liste des actus
router.get("/", authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const news = await prisma.news.findMany({
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(news);
  } catch (error) {
    console.error("Erreur GET /news:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// récupérer un post par ID
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    });

    if (!news) {
      return res.status(404).json({ error: "Post introuvable" });
    }

    return res.json(news);
  } catch (error) {
    console.error("Erreur GET /news/:id:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// creer une actu (modo/admin)
router.post(
  "/",
  authMiddleware,
  requireRole("MODERATOR", "ADMIN"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Titre et contenu requis" });
      }

      const news = await prisma.news.create({
        data: {
          title,
          content,
          authorId: req.user!.id,
        },
        include: {
          author: { select: { id: true, username: true, role: true } },
        },
      });

      // push sse feed
      newsEmitter.emit("new_news", news);

      // créer une notification pour chaque utilisateur (sauf l'auteur)
      const users = await prisma.user.findMany({
        where: { id: { not: req.user!.id } },
        select: { id: true },
      });

      if (users.length > 0) {
        const created = await Promise.all(
          users.map((u) =>
            prisma.notification.create({
              data: {
                type: "NEW_NEWS",
                content: `Nouvelle actualité : "${news.title}"`,
                userId: u.id,
              },
            })
          )
        );

        created.forEach((notif) => {
          notificationEmitter.emit("notification", {
            userId: notif.userId,
            notification: notif,
          });
        });
      }

      return res.status(201).json(news);
    } catch (error) {
      console.error("Erreur POST /news:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

// modifier une actu (auteur uniquement)
router.patch("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({ error: "Aucune donnée à modifier" });
    }

    // Vérifier que le post existe et appartient à l'utilisateur
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      return res.status(404).json({ error: "Actualité introuvable" });
    }

    if (existingNews.authorId !== req.user!.id) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    // Mise à jour
    const updated = await prisma.news.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error("Erreur PATCH /news/:id:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
