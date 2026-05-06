import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth";
import { newsEmitter } from "../sse/notifications";

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

      // push sse
      newsEmitter.emit("new_news", news);

      return res.status(201).json(news);
    } catch (error) {
      console.error("Erreur POST /news:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

export default router;
