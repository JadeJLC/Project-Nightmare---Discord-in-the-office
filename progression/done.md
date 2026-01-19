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
