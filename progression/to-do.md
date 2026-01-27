# Real Time forum (aka Project Nightmare : Discord in the office)

_Les choses non demandées dans le sujet mais pouvant être intégrées en bonus pour complétéer et améliorer le forum sont indiquées en italique_

## Objectif

Créer un forum officiel pour la licence Project Nightmare. Le forum doit :

- Être sur une seule page HTML (single page application) modifiée par javascript en fonction des données demandées
- Permettre aux utilisateurs de s'inscrire et de se connecter, puis de poster ou de répondre à des sujets/messages
- Posséder une base de données SQlite
- Avoir un serveur en Go et un front en JS, HTML et CSS

### Sujets et messages

Comme dans le premier forum, il faut pouvoir :

- Créer un nouveau sujet et y attribuer une (ou plusieurs 🙄) catégories
- Répondre à un sujet
- Voir la liste des sujets récents sur la page d'accueil (ou une autre page dédiée)
- _Like/dislike_

### Messages privés

Un système de messages privés doit être disponible sur le forum, sous la forme d'un chat simili-discord. Les utilisateurs doivent :

- Savoir qui est en ligne ou hors ligne
- Pouvoir envoyer des messages aux autres utilisateurs actuellement en ligne

La section MP doit :

- Être accessible en permanence (j'aurais tendance à dire ouvrable et refermable, parce que la liste permanente c'est un peu chiant)
- Avoir les utilisateurs rangés dans l'ordre du dernier message (comme dans les MPs discord), et alphabétique pour ceux auquel aucun message n'a été envoyé
- Afficher les 10 derniers messages de la conversation lorsque l'on clique sur un utilisateur, et afficher les précédents uniquement en scrollant (throttle, debounce, etc)
- Envoyer des notifications en temps réel lorsque l'ont reçoit un nouveau message

Format des messages :

- Date d'envoi du message
- Nom d'utilisateur de la personne ayant envoyé le message
- Contenu du message
- (optionnel) "... est en train d'écrire"

### Bonus de l'audit

- Avoir un profil d'utilisateur
- Possibilité d'envoyer des images par MP
- Fonctions asynchrones

## Aspect des pages

### A intégrer au minimum

- Une catégorie "Règles de la communauté ✔
- Une catégorie "News développeur" pour indiquer les mises à jour et les prochains jeux ✔
- Une catégorie "Suggestions" pour les joueurs ✔
- Une catégorie "Discussion" ✔
- Une catégorie par jeu Project Nightmare pour discuter du jeu ✔

### Profil utilisateur

- Nom et infos personnelles sur son propre profil / _Uniquement nom d'utilisateur et âge/genre sur le profil des autres_
- Voir la liste des messages postés, la liste des sujets ouverts _et la liste des messages likés_
- _Ajouter une image de profil si on ajoute un système d'image_
- _Cliquer sur le nom d'un utilisateur permet d'accéder à son profil_

### Sujets et messages

- Titre du sujet, contenu du premier message
- Nom _et avatar_ de la personne ayant posté le message
- Contenu des réponses en dessous
- _Possibilité d'envoyer des vidéos sur les messages (pour partager sa partie)_
- _Section "streaming" pour partager son jeu en direct_

### Page d'accueil

- Liste des sujets du forum rangés par catégorie
- Accès à une page "Sujets actifs" qui affiche les derniers sujets ayant reçu des réponses _avec date et posteur du dernier message_

### Barre de navigation

- Bouton notifications
- Bouton ouvrir/fermer la liste des utilisateurs en ligne (cliquer sur un utilisateur ouvre les messages privés)
- Bouton connexion/déconnexion
- Bouton "voir/modifier mon profil"

### _Panneau d'administration et modération_

- _Permettre aux utilisateurs de modifier leurs messages_
- _Permettre aux modérateurs/admin de supprimer ou déplacer des messages_
- _Panneau d'administration permettant de renommer des utilisateurs, des catégories et des sujets + de déplacer les sujets dans une autre catégorie_
- _Système de banissement, suppression et "promotion" des utilisateurs_

## Packages autorisés

- Go standard
- Gorilla websocket
- sqlite3
- bcrypt
- gofrs/uuid or google/uuid

## Tâches

### Back

- Gestion des cookies et des sessions
- Création et organisation de la base de données ✔
- Gestion des notifications
- Affichage des nouveaux messages privés en temps réel
- Détecter si un utilisateur est en ligne

### Front

- Formulaire d'inscription / connexion
- Design du forum (CSS)
- Créer les différentes pages via le javascript
- _Petites animations avec les personnages à divers endroits du forum_
