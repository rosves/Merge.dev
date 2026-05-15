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

// profil public d'un utilisateur avec ses posts
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    
    if (Array.isArray(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }
    
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        bio: true,
        professionalTitle: true,
        skills: true,
        github: true,
        linkedin: true,
        createdAt: true,
        news: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Parser skills JSON string to array
    const profile = {
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : [],
    };

    return res.json(profile);
  } catch (error) {
    console.error("Erreur GET /users/:id:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// modifier son propre profil
router.patch("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { bio, professionalTitle, skills, github, linkedin } = req.body;

    // Valider les skills (array de strings)
    let skillsJson = null;
    if (skills) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({ error: "skills doit être un tableau" });
      }
      skillsJson = JSON.stringify(skills);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        bio: bio || null,
        professionalTitle: professionalTitle || null,
        skills: skillsJson,
        github: github || null,
        linkedin: linkedin || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        bio: true,
        professionalTitle: true,
        skills: true,
        github: true,
        linkedin: true,
      },
    });

    // Parser skills pour le retour
    const profile = {
      ...updatedUser,
      skills: updatedUser.skills ? JSON.parse(updatedUser.skills) : [],
    };

    return res.json(profile);
  } catch (error) {
    console.error("Erreur PATCH /users/profile:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;