import { Router, Response } from "express";
import { EventEmitter } from "events";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// emitters partages pour le sse
export const newsEmitter = new EventEmitter();
export const notificationEmitter = new EventEmitter();

router.get("/news", authMiddleware, (req: AuthRequest, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // heartbeat pour garder la connexion
  const heartbeat = setInterval(() => {
    res.write(":heartbeat\n\n");
  }, 30000);

  const onNewNews = (news: any) => {
    res.write(`event: new_news\n`);
    res.write(`data: ${JSON.stringify(news)}\n\n`);
  };

  newsEmitter.on("new_news", onNewNews);

  req.on("close", () => {
    clearInterval(heartbeat);
    newsEmitter.off("new_news", onNewNews);
  });
});

router.get("/notifications", authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const heartbeat = setInterval(() => {
    res.write(":heartbeat\n\n");
  }, 30000);

  // filtre par userId
  const onNotification = (data: { userId: number; notification: any }) => {
    if (data.userId === userId) {
      res.write(`event: notification\n`);
      res.write(`data: ${JSON.stringify(data.notification)}\n\n`);
    }
  };

  notificationEmitter.on("notification", onNotification);

  req.on("close", () => {
    clearInterval(heartbeat);
    notificationEmitter.off("notification", onNotification);
  });
});

export default router;
