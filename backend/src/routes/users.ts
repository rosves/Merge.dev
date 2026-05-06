import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// tous les users sauf le user connecte
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user!.id } },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
      orderBy: { username: "asc" },
    });

    return res.json(users);
  } catch (error) {
    console.error("Erreur GET /users:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
