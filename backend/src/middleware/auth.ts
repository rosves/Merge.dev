import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-prod";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  
  const token = req.headers.authorization?.split(" ")[1] || req.query.token as string;

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
}

// verif role
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };
}
