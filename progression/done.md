# Éléments intégrés

## Base de données

### Tables

- Table **"users"** avec : user_id, pseudo, nom, prénom, âge, genre, mot de passe, email
- Table **"categories"** avec : cat_id, titre, description
- Table **"topics"** avec : topic_id, categorie, titre, date d'ouverture, auteur du premier post
- Table **"messages"** avec : post_id, sujet, contenu, auteur, date de création, nombre de réactions
- Table **"roles"** avec : role_id, nom du rôle (Admin, modo, membre, banni)
- Table **"reactions"** avec : type (like, dislike, etc), id du post concerné, id de la personne ayant réagi
- Table **"sessions** avec : id, utilisateur, données, date d'expiration, date de création

### Remplissage initial

#### Catégories

- Catégorie 1 : Règles et explications
- Catégorie 2 : News développeur
- Catégorie 3 : Suggestions des joueurs
- Catégorie 4 : Discussions
- Catégorie 5 : Deadline Invaders

#### Roles

- Role 0 : Admin
- Role 1 : Modo
- Role 2 : Membre
- Role 3 : Banni

### Affichage

- Header
- Sélecteur de thème
- Feed / Catégories
- Profil
- Sujets / Messages

### Inscription et connexion

Données d'inscriptions demandées :

- Pseudo
- Âge et genre
- Prénom et nom de famille
- Adresse mail
- Mot de passe
  Il doit être possible de se connecter en utilisant le pseudo ou l'adresse mail

### Profil utilisateur

- Nom et infos personnelles sur son propre profil / Uniquement nom d'utilisateur et âge/genre sur le profil des autres
- Liste des messages postés, liste des sujets ouverts et liste des réactions
- Image de profil
- Cliquer sur le nom d'un utilisateur permet d'accéder à son profil
- Possibilité d modifier ses informations personnelles
- Possibilité de modifier son image de profil

### Sujets et messages

- Titre du sujet, contenu du premier message
- Nom et avatar de la personne ayant posté le message
- Contenu des réponses en dessous
- Créer un nouveau sujet et y attribuer une catégorie
- Répondre à un sujet
- Modifier ses propres messages
- Réagir à un message

### Page d'accueil

- Liste des sujets du forum rangés par catégorie (visuel de base)
- Accès à un visuel feed qui affiche les derniers sujets ayant reçu des réponses avec date et posteur du dernier message

### Barre de navigation

- Bouton connexion/déconnexion
- Bouton "voir mon profil"
- Bouton ouvrir/fermer la liste des utilisateurs en ligne (cliquer sur un utilisateur ouvre les messages privés)
- Bouton notifications

### Interface utilisateur

- Bouton retour arrière pour pouvoir revenir sur la page précédente

### Messages privés

- Avoir les utilisateurs rangés dans l'ordre du dernier message (comme dans les MPs discord), et alphabétique pour ceux auquel aucun message n'a été envoyé
- Envoyer des notifications en temps réel lorsque l'ont reçoit un nouveau message

### Back

- Gestion des cookies et des sessions
- Création et organisation de la base de données
- Détecter si un utilisateur est en ligne
- Gestion des notifications
- Affichage des nouveaux messages privés en temps réel

### Front

- Formulaire d'inscription / connexion

### Sécurité

- Sécurisation des input pour éviter les injections HTML ou SLQ
- Sécurisation des ID utilisateur pour réduire les risques de piratage de compte
- Sécurisation des messages envoyés par l'utilisateur (rejette le HTML)

### Messages privés

- Savoir qui est en ligne ou hors ligne
- Pouvoir envoyer des messages aux autres utilisateurs actuellement en ligne
- Section "en ligne" accessible en permanence
- Boîte MP pour les détails des conversation
- N'affiche que les dix derniers messages de la conversation
- Afficher les 10 derniers messages de la conversation lorsque l'on clique sur un utilisateur, et afficher les précédents uniquement en scrollant
  **Contenu**

- Date d'envoi du message
- Nom d'utilisateur de la personne ayant envoyé le message
- Contenu du message

### Administration et modération

- Permettre aux utilisateurs de modifier leurs messages

### Front

- Design du forum (CSS)
- Créer les différentes pages via le javascript
