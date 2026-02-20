PRAGMA foreign_keys = OFF;

-- 1. ROLES (indépendant, en premier pour les FK)
CREATE TABLE roles_new (
    role_id   integer primary key autoincrement not null,
    role_name text
);
INSERT INTO roles_new SELECT * FROM roles;

-- 2. USERS (dépend de roles)
CREATE TABLE users_new (
    user_id     text    primary key unique not null,
    username    text    unique not null,
    email       text    unique not null,
    password    blob    not null,
    age         integer,
    gender      text    not null,
    firstname   text    not null,
    lastname    text    not null,
    token       text,
    image       text    not null default 'carla',
    inscription text    not null,
    role        integer references roles(role_id),
    sound       text    not null default 'on'
);
INSERT INTO users_new SELECT * FROM users;

-- 3. CATEGORIES (indépendant)
CREATE TABLE categories_new (
    cat_id      integer primary key autoincrement not null,
    name        text    unique not null,
    description text
);
INSERT INTO categories_new SELECT * FROM categories;

-- 4. TOPICS (dépend de categories, users)
CREATE TABLE topics_new (
    topic_id   integer primary key autoincrement not null,
    cat_id     integer not null references categories(cat_id),
    title      text    unique not null,
    created_on datetime not null default current_timestamp,
    author     text     not null references users(user_id)
);
INSERT INTO topics_new SELECT topic_id, cat_id, title, created_on, author FROM topics;

-- 5. MESSAGES (dépend de topics, users) — REACTIONS COLONNE SUPPRIMÉE
CREATE TABLE messages_new (
    post_id    integer primary key autoincrement not null,
    topic_id   integer not null references topics(topic_id) on delete cascade,
    author     text    not null references users(user_id),
    content    text    not null,
    created_on datetime not null default current_timestamp
);
INSERT INTO messages_new (post_id, topic_id, author, content, created_on)
SELECT post_id, topic_id, author, content, created_on FROM messages;

-- 6. REACTIONS (dépend de users, messages)
CREATE TABLE reactions_new (
    reaction_type text    not null default 'like',
    user_id       text    references users(user_id),
    post_id       integer references messages(post_id)
);
INSERT INTO reactions_new SELECT * FROM reactions;

-- 7. CONVERSATIONS (dépend de users)
CREATE TABLE conversations_new (
    id         integer primary key autoincrement not null,
    user1_id   text    not null references users(user_id) on delete cascade,
    user2_id   text    not null references users(user_id) on delete cascade,
    last_dm_at datetime not null default current_timestamp
);
INSERT INTO conversations_new SELECT * FROM conversations;

-- 8. DMS (dépend de users)
CREATE TABLE dms_new (
    id          integer primary key autoincrement not null,
    sender_id   text    not null references users(user_id) on delete cascade,
    receiver_id text    not null references users(user_id) on delete cascade,
    content     text    not null,
    created_at  datetime not null default current_timestamp
);
INSERT INTO dms_new SELECT * FROM dms;

-- 9. NOTIFICATIONS (dépend de users)
CREATE TABLE notifications_new (
    notif_id    integer primary key autoincrement not null,
    receiver_id text    not null references users(user_id),
    message     text    not null,
    status      text    not null default 'new',
    time        datetime not null default current_timestamp,
    data        text    not null
);
INSERT INTO notifications_new SELECT * FROM notifications;

-- 10. SESSIONS (dépend de users)
CREATE TABLE sessions_new (
    id         text    primary key,
    user_id    text    references users(user_id),
    data       text,
    expiration datetime,
    created_on datetime not null default current_timestamp
);
INSERT INTO sessions_new SELECT * FROM sessions;

-- 11. MUTEDTOPICS (dépend de users, topics)
CREATE TABLE mutedtopics_new (
    user_id  text    not null references users(user_id),
    topic_id integer not null references topics(topic_id)
);
INSERT INTO mutedtopics_new SELECT * FROM mutedtopics;

-- Switch (ordre inverse des dépendances pour éviter erreurs FK)
DROP TABLE IF EXISTS mutedtopics;   ALTER TABLE mutedtopics_new   RENAME TO mutedtopics;
DROP TABLE IF EXISTS sessions;      ALTER TABLE sessions_new      RENAME TO sessions;
DROP TABLE IF EXISTS notifications; ALTER TABLE notifications_new RENAME TO notifications;
DROP TABLE IF EXISTS dms;           ALTER TABLE dms_new           RENAME TO dms;
DROP TABLE IF EXISTS conversations; ALTER TABLE conversations_new RENAME TO conversations;
DROP TABLE IF EXISTS reactions;     ALTER TABLE reactions_new     RENAME TO reactions;
DROP TABLE IF EXISTS messages;      ALTER TABLE messages_new      RENAME TO messages;
DROP TABLE IF EXISTS topics;        ALTER TABLE topics_new        RENAME TO topics;
DROP TABLE IF EXISTS categories;    ALTER TABLE categories_new    RENAME TO categories;
DROP TABLE IF EXISTS users;         ALTER TABLE users_new         RENAME TO users;
DROP TABLE IF EXISTS roles;         ALTER TABLE roles_new         RENAME TO roles;

PRAGMA foreign_keys = ON;