import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // reset
  await prisma.notification.deleteMany();
  await prisma.groupMessage.deleteMany();
  await prisma.message.deleteMany();
  await prisma.news.deleteMany();
  await prisma.user.deleteMany();

  // users
  const admin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      username: "Admin",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  const modo = await prisma.user.create({
    data: {
      email: "modo@test.com",
      username: "Moderateur",
      password: await bcrypt.hash("modo123", 10),
      role: "MODERATOR",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@test.com",
      username: "JuniorDev",
      password: await bcrypt.hash("user123", 10),
      role: "USER",
    },
  });

  
  const user2 = await prisma.user.create({
    data: {
      email: "alice@test.com",
      username: "Alice",
      password: await bcrypt.hash("alice123", 10),
      role: "USER",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "bob@test.com",
      username: "Bob",
      password: await bcrypt.hash("bob123", 10),
      role: "USER",
    },
  });

  
  await prisma.message.createMany({
    data: [
      {
        content: "Bonjour ! J'ai une question sur React, vous êtes disponible ?",
        senderId: user.id,
        receiverId: modo.id,
        createdAt: new Date("2025-05-01T10:00:00"),
      },
      {
        content: "Bien sûr, je t'écoute ! Qu'est-ce qui te bloque ?",
        senderId: modo.id,
        receiverId: user.id,
        createdAt: new Date("2025-05-01T10:05:00"),
      },
      {
        content: "Je ne comprends pas bien useEffect sans tableau de dépendances.",
        senderId: user.id,
        receiverId: modo.id,
        createdAt: new Date("2025-05-01T10:07:00"),
      },
      {
        content:
          "Sans tableau de dépendances, useEffect s'exécute après chaque rendu. Avec un tableau vide [], il ne s'exécute qu'au montage.",
        senderId: modo.id,
        receiverId: user.id,
        read: true,
        createdAt: new Date("2025-05-01T10:10:00"),
      },
      {
        content: "Salut Admin, j'ai un souci avec mon compte.",
        senderId: user2.id,
        receiverId: admin.id,
        createdAt: new Date("2025-05-02T14:00:00"),
      },
      {
        content: "Je regarde ça, quel est le problème exactement ?",
        senderId: admin.id,
        receiverId: user2.id,
        createdAt: new Date("2025-05-02T14:05:00"),
      },
    ],
  });

  
  await prisma.groupMessage.createMany({
    data: [
      {
        content: "Bienvenue sur le canal modération ! N'hésitez pas à signaler tout problème ici.",
        senderId: admin.id,
        createdAt: new Date("2025-05-01T09:00:00"),
      },
      {
        content: "Merci ! J'ai remarqué un user qui spam, je m'en occupe.",
        senderId: modo.id,
        createdAt: new Date("2025-05-01T09:30:00"),
      },
      {
        content: "Parfait, tiens-moi au courant.",
        senderId: admin.id,
        createdAt: new Date("2025-05-01T09:35:00"),
      },
    ],
  });

  
  await prisma.news.createMany({
    data: [
      {
        title: "Bienvenue sur MentorTech !",
        content:
          "La plateforme de mentorat tech est officiellement lancée. Connectez-vous pour trouver un mentor et progresser dans votre apprentissage du développement web.",
        authorId: admin.id,
        createdAt: new Date("2025-04-28T08:00:00"),
      },
      {
        title: "Nouveau : sessions de code review",
        content:
          "Les modérateurs proposent désormais des sessions de code review en direct. Envoyez un message privé à un modérateur pour réserver un créneau.",
        authorId: modo.id,
        createdAt: new Date("2025-04-30T12:00:00"),
      },
      {
        title: "Mise à jour des règles de la communauté",
        content:
          "Nous avons mis à jour les règles de la communauté. Merci de les consulter dans la section À propos. Tout manquement pourra entraîner une suspension temporaire.",
        authorId: admin.id,
        createdAt: new Date("2025-05-02T16:00:00"),
      },
    ],
  });

  
  await prisma.notification.createMany({
    data: [
      {
        type: "NEW_MESSAGE",
        content: "Moderateur vous a envoyé un message",
        userId: user.id,
        read: false,
        createdAt: new Date("2025-05-01T10:05:00"),
      },
      {
        type: "NEW_NEWS",
        content: 'Nouvelle actualité : "Nouveau : sessions de code review"',
        userId: user.id,
        read: false,
        createdAt: new Date("2025-04-30T12:00:00"),
      },
      {
        type: "NEW_NEWS",
        content: 'Nouvelle actualité : "Mise à jour des règles de la communauté"',
        userId: user.id,
        read: true,
        createdAt: new Date("2025-05-02T16:00:00"),
      },
    ],
  });

  console.log("Seed termine");
  console.log("Comptes : admin@test.com/admin123, modo@test.com/modo123, user@test.com/user123");
}

main()
  .catch((e) => {
    console.error("Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
