import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Création des fixtures...");

  // Nettoyer la BDD
  await prisma.notification.deleteMany();
  await prisma.groupMessage.deleteMany();
  await prisma.message.deleteMany();
  await prisma.news.deleteMany();
  await prisma.user.deleteMany();

  // Hash du mot de passe par défaut
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Créer des utilisateurs
  const users = await Promise.all([
    // Juniors (ne peuvent PAS poster)
    prisma.user.create({
      data: {
        email: "junior1@test.com",
        username: "JulienM",
        password: hashedPassword,
        role: "USER",
        bio: "Développeur junior passionné par React et TypeScript. En quête d'apprentissage continu.",
        professionalTitle: "junior frontend developer · 1 an d'expérience",
        skills: JSON.stringify(["react", "typescript", "tailwind", "git"]),
        github: "https://github.com/julienm",
        linkedin: "https://linkedin.com/in/julienm",
      },
    }),
    prisma.user.create({
      data: {
        email: "junior2@test.com",
        username: "MarieD",
        password: hashedPassword,
        role: "USER",
        bio: "En reconversion dans le dev après 5 ans en marketing. Motivée et curieuse !",
        professionalTitle: "junior fullstack · reconversion",
        skills: JSON.stringify(["javascript", "node.js", "express", "sql"]),
        github: "https://github.com/maried",
      },
    }),
    prisma.user.create({
      data: {
        email: "junior3@test.com",
        username: "ThomasB",
        password: hashedPassword,
        role: "USER",
        bio: "Étudiant en dernière année d'école d'ingénieur. Fan de clean code et d'architecture.",
        professionalTitle: "étudiant · esgi 2025",
        skills: JSON.stringify(["python", "django", "docker", "aws"]),
      },
    }),

    // Mentors (peuvent poster)
    prisma.user.create({
      data: {
        email: "mentor1@test.com",
        username: "SophieA",
        password: hashedPassword,
        role: "MODERATOR",
        bio: "Ex-Doctolib, je travaille aujourd'hui sur des architectures React à grande échelle. J'aide les juniors à structurer leur code et à éviter les pièges de la prod.",
        professionalTitle: "senior frontend engineer · 7 ans d'expérience",
        skills: JSON.stringify([
          "react",
          "typescript",
          "next.js",
          "testing",
          "design systems",
        ]),
        github: "https://github.com/sophiea",
        linkedin: "https://linkedin.com/in/sophiea",
      },
    }),
    prisma.user.create({
      data: {
        email: "mentor2@test.com",
        username: "PierreL",
        password: hashedPassword,
        role: "MODERATOR",
        bio: "Lead backend chez une scale-up parisienne. Spécialisé en microservices, event-driven architecture et performance.",
        professionalTitle: "lead backend engineer · 10 ans",
        skills: JSON.stringify([
          "node.js",
          "go",
          "kubernetes",
          "postgresql",
          "kafka",
        ]),
        github: "https://github.com/pierrel",
      },
    }),
    prisma.user.create({
      data: {
        email: "admin@test.com",
        username: "AdminDev",
        password: hashedPassword,
        role: "ADMIN",
        bio: "Admin de la plateforme. CTO avec 15 ans d'expérience. Passionné par le mentorat et la transmission.",
        professionalTitle: "cto · 15 ans d'expérience",
        skills: JSON.stringify([
          "architecture",
          "leadership",
          "cloud",
          "devops",
          "product",
        ]),
        linkedin: "https://linkedin.com/in/admindev",
      },
    }),
  ]);

  console.log(`${users.length} utilisateurs créés`);

  // Créer des posts (UNIQUEMENT par mentors et admin)
  const posts = await Promise.all([
    prisma.news.create({
      data: {
        title: "React Server Components : ce qu'il faut savoir",
        content: `Les RSC changent la donne en React. L'idée : pourquoi expédier du JS au navigateur pour un composant qui ne fait que lire des données ? Avec les RSC, ce composant est rendu côté serveur, son code n'arrive jamais dans le bundle.

Le data fetching devient une opération locale — un simple await fetch() en haut du composant. Fini les useEffect et les états de chargement à gérer manuellement.

Mon conseil : commencez par les pages read-only (profils, listes, dashboards). Migrez le fetching vers des composants serveur, gardez le client pour l'interactivité. Votre bundle fondra.`,
        authorId: users[3].id, // Sophie (MODERATOR)
      },
    }),
    prisma.news.create({
      data: {
        title: "Déboguer une app en production sans logs ? Possible.",
        content: `Hier, bug critique en prod. Pas de logs exploitables. Voici comment j'ai trouvé :

1. APM activé (Sentry) → trace des requêtes lentes
2. Distributed tracing → suivi inter-services
3. Correlation IDs → liaison des événements
4. Feature flags → isolation progressive

Résultat : bug identifié en 20min. Les logs c'est bien, mais l'observabilité structurée c'est mieux.`,
        authorId: users[4].id, // Pierre (MODERATOR)
      },
    }),
    prisma.news.create({
      data: {
        title: "Tests end-to-end : Playwright vs Cypress en 2025",
        content: `Après 6 mois sur les deux : Playwright gagne.

Pourquoi ?
• Multi-browser natif (Chrome, Firefox, Safari)
• Parallélisation out-of-the-box
• Network interception plus propre
• Trace viewer intégré (debug en un clic)
• Maintenance moins chronophage

Cypress reste top pour débuter (DX incroyable), mais à l'échelle Playwright tient mieux la route.`,
        authorId: users[3].id, // Sophie (MODERATOR)
      },
    }),
    prisma.news.create({
      data: {
        title: "Design systems : un système qui scale vraiment",
        content: `Chez nous, on a migré vers un design system centralisé. Les bénéfices après 6 mois :

• Vélocité dev +40% sur les nouvelles features
• Cohérence UI enfin au rendez-vous
• Onboarding des juniors divisé par 2
• Maintenance CSS quasi nulle

Les clés : design tokens, composants atomiques, documentation vivante (Storybook), et surtout buy-in de toute l'équipe produit.`,
        authorId: users[5].id, // Admin (ADMIN)
      },
    }),
    prisma.news.create({
      data: {
        title: "Microservices : quand NE PAS les utiliser",
        content: `Les microservices ne sont pas une solution miracle.

 Évitez si :
• Équipe < 10 devs
• Domaine métier simple
• Pas de contraintes de scale spécifiques
• Pas d'expertise DevOps/SRE interne

Dans 80% des cas, un monolithe bien structuré (modulaire, découplé) suffit largement. Les microservices apportent de la complexité distribuée : réseau, cohérence, monitoring, déploiement.

Commencez simple. Splitez quand la douleur arrive, pas avant.`,
        authorId: users[4].id, // Pierre (MODERATOR)
      },
    }),
    prisma.news.create({
      data: {
        title: "Comment j'ai migré de TypeORM vers Prisma",
        content: `Migration complète d'une API Express + TypeORM vers Prisma en 2 semaines.

Ce qui a changé :
• Type safety de bout en bout (plus de any)
• Migrations auto-générées (fini les migrations SQL à la main)
• Requêtes 30% plus rapides (optimiseur interne)
• DX incomparable (autocomplete, erreurs claires)

Le seul regret : ne pas avoir migré plus tôt. Prisma est un game-changer pour les apps TypeScript.`,
        authorId: users[3].id, // Sophie (MODERATOR)
      },
    }),
  ]);

  console.log(`${posts.length} posts créés (par mentors/admin uniquement)`);

  // Créer quelques messages
  await prisma.message.createMany({
    data: [
      {
        senderId: users[0].id,
        receiverId: users[3].id,
        content: "Salut Sophie ! J'ai une question sur les hooks customs...",
      },
      {
        senderId: users[3].id,
        receiverId: users[0].id,
        content:
          "Hello Julien ! Vas-y, je t'écoute. C'est quoi ton use case ?",
      },
      {
        senderId: users[1].id,
        receiverId: users[4].id,
        content:
          "Pierre, tu as 10 min pour un point sur l'archi micro-services ?",
      },
    ],
  });

  console.log("Messages créés");

  console.log("Fixtures créées avec succès !");
  console.log("Comptes de test :");
  console.log("   Junior 1 : junior1@test.com / password123 (ne peut PAS poster)");
  console.log("   Junior 2 : junior2@test.com / password123 (ne peut PAS poster)");
  console.log("   Mentor 1 : mentor1@test.com / password123 (peut poster)");
  console.log("   Mentor 2 : mentor2@test.com / password123 (peut poster)");
  console.log("   Admin    : admin@test.com / password123 (peut poster)");
}

main()
  .catch((e) => {
    console.error(" Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
