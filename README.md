# Project Nightmare - Discord in the Office

<div align="center">

**Forum de discussion avec messagerie privée en temps réel, dans l'univers thématique de Project Nightmare.**

</div>

## Aperçu

Project Nightmare - Discord in the Office est une application de forum programmée en Go et JavaScript. L'application combine des fonctionnalités de forum classique avec un système de messagerie privée en temps réel, le tout dans l'univers humoristique de Project Nightmare.
C'est un projet d'études développé dans le cadre de la formation à Zone01, visant à créer une plateforme de discussion complète avec forum, chat privé via WebSockets, et gestion d'utilisateurs.

## Fonctionnalités

- **Forum de discussion** : Création de sujets et de réponses organisés par catégories
- **Messagerie privée en temps réel** : Chat instantané entre utilisateurs via WebSockets
- **Gestion des utilisateurs** : Système d'authentification et profils utilisateurs
- **Historique des discussions** : Stockage et récupération des conversations et posts
- **Thématique Project Nightmare** : Intégration dans l'univers du jeu avec éléments visuels cohérents

## Technologies utilisées

**Backend & Frontend:**

[![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/API/WebSocket)
[![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)

## Utilisation

### Prérequis

Go doit être installé sur votre ordinateur.

- **Go**: Version 1.21 ou plus. Téléchargement : [golang.org](https://golang.org/dl/).

### Installation

1.  **Cloner le repo**
```bash
    git clone https://github.com/JadeJLC/Project-Nightmare---Discord-in-the-office.git
    cd Project-Nightmare---Discord-in-the-office
```

2.  **Lancer le serveur**
```bash
    go run .
```

3.  **Accéder à l'application**
    
    Ouvrez votre navigateur et accédez à l'adresse affichée dans le terminal (généralement `http://localhost:8080`)

### **Utilisation de l'application**

1. **Connexion** : Créez un compte ou connectez-vous
2. **Forum** : Parcourez les catégories, créez des sujets et participez aux discussions
3. **Messagerie privée** : Envoyez des messages instantanés aux autres utilisateurs via le chat en temps réel
4. **Interactions** : Répondez aux posts et discutez avec la communauté

## Structure du projet
```
project-root/
├── database/       # Gestion de la base de données (utilisateurs, posts, messages)
├── internal/       # Logique interne de l'application
├── progression/    # Suivi de progression (lié à l'univers Project Nightmare)
├── server/         # Serveur HTTP et WebSocket
├── go.mod          # Go module
├── go.sum          # Dépendances Go
└── readme.md       # Ce fichier
```

## Development

### Architecture

- **Backend** : Serveur Go avec gestion WebSocket pour les messages privés en temps réel
- **Frontend** : Interface JavaScript avec mise à jour dynamique
- **Base de données** : Stockage persistant des utilisateurs, posts de forum et messages privés
- **Communication** : WebSocket pour la messagerie privée instantanée

### Fonctionnalités

**Forum :**
- Création et gestion de sujets de discussion
- Système de réponses et de commentaires
- Organisation par catégories

**Messagerie privée :**
- Chat en temps réel via WebSockets
- Notifications de nouveaux messages
- Historique des conversations

## Apprentissages clés

Ce projet permet de développer des compétences dans :

- Développement d'applications web hybrides (forum + chat)
- Programmation réseau avec WebSockets
- Architecture client-serveur temps réel
- Gestion de connexions concurrentes en Go
- Communication bidirectionnelle pour le chat privé
- Gestion de base de données avec Go
- Interface utilisateur réactive en JavaScript
- Authentification et gestion de sessions

## Autres informations

- Ce projet est développé dans le cadre de ma formation à Zone01.
- L'objectif était de créer une plateforme de discussion complète combinant forum et chat en temps réel.
- Fait partie de l'univers étendu de Project Nightmare.

## Améliorations futures

- [ ] Système de notifications pour les réponses au forum
- [ ] Partage de fichiers et d'images
- [ ] Réactions et émojis personnalisés
- [ ] Mentions d'utilisateurs (@username)
- [ ] Rôles et permissions avancés

<div align="center">

Par [JadeJLC](https://github.com/JadeJLC) et [Nathan Paccoud](https://github.com/NathPacc)

</div>
