# Merge.dev — Plateforme de mentorat tech

## Équipe

| Prénom | NOM | Classe |
|--------|-----|--------|
| Lytween | VICTOIRE | 5IWRJ |
| Elias | DUVERNOIS | 5IWRJ |

---

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose installés et en cours d'exécution
- Git

---

## Installation et lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/rosves/Merge.dev.git
cd Merge.dev
```

### 2. Lancer les conteneurs

```bash
docker-compose up --build
```

> Le premier lancement prend quelques minutes (installation des dépendances). La base de données est initialisée automatiquement au démarrage.

### 3. Accéder à l'application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend (API) | http://localhost:4000 |

> ⚠️ **Important — langue dans l'URL**
>
> L'application utilise un routage i18n. L'URL doit **toujours** contenir le code de langue :
> - Français : `http://localhost:3000/fr/dashboard`
> - Anglais : `http://localhost:3000/en/dashboard`
>
> Accéder directement à `http://localhost:3000` sans segment de langue fonctionne (redirection automatique), mais si vous êtes redirigé vers une page blanche ou une erreur 404, ajoutez manuellement `/fr` ou `/en` dans l'URL.

---

## Jeux de données (fixtures)

Pour peupler la base avec des données de test (utilisateurs, posts, messages) :

```bash
docker exec mentorat-backend npx ts-node prisma/seed.ts
```

> Cette commande réinitialise complètement la base de données avant d'insérer les fixtures.

---

## Comptes de test

Tous les comptes utilisent le mot de passe : **`password123`**

| Rôle | Email | Username | Mot de passe | Permissions |
|------|-------|----------|--------------|-------------|
| **Junior** (USER) | `junior1@test.com` | JulienM | `password123` | Lecture du feed, messagerie privée |
| **Junior** (USER) | `junior2@test.com` | MarieD | `password123` | Lecture du feed, messagerie privée |
| **Junior** (USER) | `junior3@test.com` | ThomasB | `password123` | Lecture du feed, messagerie privée |
| **Mentor** (MODERATOR) | `mentor1@test.com` | SophieA | `password123` | + Publication d'actualités, canal modération |
| **Mentor** (MODERATOR) | `mentor2@test.com` | PierreL | `password123` | + Publication d'actualités, canal modération |
| **Admin** (ADMIN) | `admin@test.com` | AdminDev | `password123` | Toutes les permissions |

---

## Technologies

- **Frontend** : Next.js 15 (App Router), TypeScript, Tailwind CSS, next-intl (i18n)
- **Backend** : Express, TypeScript, Prisma (SQLite), Socket.io, JWT
- **Temps réel** : WebSocket (messagerie), SSE (actualités, notifications)
- **Containerisation** : Docker, Docker Compose
