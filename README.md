# Merge.dev — Plateforme de mentorat tech

## Équipe

| Prénom | NOM | Classe |
|--------|-----|--------|
| Lytween | VICTOIRE| 5IWRJ |
| Elias | DUVERNOIS| 5IWRJ |

---

## Installation et lancement

### Prérequis
- Docker et Docker Compose installés

### Étapes

1. Cloner le repository :
```bash
git clone https://github.com/rosves/Merge.dev.git
cd merge.dev
```

2. Lancer le projet :
```bash
docker-compose up --build
```

3. Le frontend est accessible sur **http://localhost:3000**
4. Le backend est accessible sur **http://localhost:4000**

---

## Jeux de données (fixtures)

Pour simuler la base de données avec les données de test :

```bash
docker exec mentorat-backend npx prisma migrate dev
docker exec mentorat-backend npx ts-node prisma/seed.ts
```

---

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@test.com | admin123 |
| Modérateur | modo@test.com | modo123 |
| User | user@test.com | user123 |

---

## Technologies

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS, React Hook Form, Zod, next-intl
- **Backend** : Express, TypeScript, Prisma (SQLite), Socket.io, JWT
- **Temps réel** : WebSocket (discussions), SSE (actualités, notifications)
- **Containerisation** : Docker, Docker Compose
