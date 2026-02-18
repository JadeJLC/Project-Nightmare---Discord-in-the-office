-- ============================================================
--  Schema.sql  –  SQLite 3
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
--  roles  (indépendants)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
    `role_id`   INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `role_name` TEXT
);

-- ------------------------------------------------------------
--  users  (references : roles)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `user_id`    TEXT    PRIMARY KEY UNIQUE NOT NULL,
    `username`   TEXT    UNIQUE NOT NULL,
    `email`      TEXT    UNIQUE NOT NULL,
    `password`   BLOB    NOT NULL,
    `age`        INTEGER,
    `gender`     TEXT    NOT NULL,
    `firstname`  TEXT    NOT NULL,
    `lastname`   TEXT    NOT NULL,
    `token`      TEXT,
    `image`      TEXT    NOT NULL DEFAULT 'Carla',
    `inscription` TEXT   NOT NULL,
    `role`       INTEGER REFERENCES `roles`(`role_id`),
    `sound`      TEXT    NOT NULL DEFAULT 'ON'
);

-- ------------------------------------------------------------
--  categories  (indépendant)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `cat_id`      INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name`        TEXT    UNIQUE NOT NULL,
    `description` TEXT
);

-- ------------------------------------------------------------
--  topics  (references : categories, users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `topics` (
    `topic_id`   INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `cat_id`     INTEGER NOT NULL REFERENCES `categories`(`cat_id`),
    `title`      TEXT    UNIQUE NOT NULL,
    `created_on` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `author`     TEXT     NOT NULL REFERENCES `users`(`user_id`)
);

-- ------------------------------------------------------------
--  messages  (references : topics, users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
    `post_id`    INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `topic_id`   INTEGER NOT NULL REFERENCES `topics`(`topic_id`),
    `author`     TEXT    NOT NULL REFERENCES `users`(`user_id`),
    `content`    TEXT    NOT NULL,
    `created_on` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `reactions`  INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
--  reactions  (references : users, messages)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reactions` (
    `reaction_type` TEXT    NOT NULL DEFAULT 'like',
    `user_id`       TEXT    REFERENCES `users`(`user_id`),
    `post_id`       INTEGER REFERENCES `messages`(`post_id`)
);

-- ------------------------------------------------------------
--  conversations  (references : users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conversations` (
    `id`         INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `user1_id`   TEXT    NOT NULL REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    `user2_id`   TEXT    NOT NULL REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    `last_DM_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  dms  (references : users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dms` (
    `id`          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `sender_id`   TEXT    NOT NULL REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    `receiver_id` TEXT    NOT NULL REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    `content`     TEXT    NOT NULL,
    `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  notifications  (references : users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `notif_id`    INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `receiver_id` TEXT    NOT NULL REFERENCES `users`(`user_id`),
    `message`     TEXT    NOT NULL,
    `status`      TEXT    NOT NULL DEFAULT 'new',
    `time`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data`        TEXT    NOT NULL
);

-- ------------------------------------------------------------
--  sessions  (references : users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
    `id`         TEXT    PRIMARY KEY,
    `user_id`    TEXT    REFERENCES `users`(`user_id`),
    `data`       TEXT,
    `expiration` DATETIME,
    `created_on` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  mutedtopics  (references : users, topics)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mutedtopics` (
    `user_id`  TEXT    NOT NULL REFERENCES `users`(`user_id`),
    `topic_id` INTEGER NOT NULL REFERENCES `topics`(`topic_id`)
);