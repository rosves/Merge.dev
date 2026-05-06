import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-prod";

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit faire au moins 6 caractères" });
    }

    // check si deja pris
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return res.status(409).json({ error: "Email ou nom d'utilisateur déjà pris" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword, role: "USER" },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Erreur register:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

export default router;
