PRAGMA foreign_keys = OFF;

-- 1. CATEGORIES (Note les espaces multiples pour correspondre à l'erreur)
CREATE TABLE categories_new (
    cat_id      integer primary key autoincrement not null,
    name        text    unique not null,
    description text
);
INSERT INTO categories_new SELECT * FROM categories;

-- 2. ROLES
CREATE TABLE roles_new (
    role_id   integer primary key autoincrement not null,
    role_name text
);
INSERT INTO roles_new SELECT * FROM roles;

-- 3. USERS (Espacement aligné sur 'user_id' et 'username')
CREATE TABLE users_new (
    user_id    text    primary key unique not null,
    username   text    unique not null,
    email      text    unique not null,
    password   blob    not null,
    age        integer,
    gender     text    not null,
    firstname  text    not null,
    lastname   text    not null,
    token      text,
    image      text    not null default 'carla',
    inscription text   not null,
    role       integer references roles(role_id),
    sound      text    not null default 'on'
);
INSERT INTO users_new SELECT * FROM users;

-- 4. TOPICS
CREATE TABLE topics_new (
    topic_id   integer primary key autoincrement not null,
    cat_id     integer not null references categories(cat_id),
    title      text    unique not null,
    created_on datetime not null default current_timestamp,
    author     text     not null references users(user_id)
);
INSERT INTO topics_new (topic_id, cat_id, title, created_on, author)
SELECT topic_id, cat_id, title, created_on, author FROM topics;

-- 5. MESSAGES
CREATE TABLE messages_new (
    post_id    integer primary key autoincrement not null,
    topic_id   integer not null references topics(topic_id),
    author     text    not null references users(user_id),
    content    text    not null,
    created_on datetime not null default current_timestamp
);
INSERT INTO messages_new (post_id, topic_id, author, content, created_on, reactions)
SELECT post_id, topic_id, author, content, created_on, reactions FROM messages;

-- 6. REACTIONS
CREATE TABLE reactions_new (
    reaction_type text    not null default 'like',
    user_id       text    references users(user_id),
    post_id       integer references messages(post_id)
);
INSERT INTO reactions_new SELECT * FROM reactions;

-- 7. SESSIONS
CREATE TABLE sessions_new (
    id         text    primary key,
    user_id    text    references users(user_id),
    data       text,
    expiration datetime,
    created_on datetime not null default current_timestamp
);
INSERT INTO sessions_new SELECT * FROM sessions;

-- Switch
DROP TABLE categories; ALTER TABLE categories_new RENAME TO categories;
DROP TABLE roles; ALTER TABLE roles_new RENAME TO roles;
DROP TABLE users; ALTER TABLE users_new RENAME TO users;
DROP TABLE topics; ALTER TABLE topics_new RENAME TO topics;
DROP TABLE messages; ALTER TABLE messages_new RENAME TO messages;
DROP TABLE reactions; ALTER TABLE reactions_new RENAME TO reactions;
DROP TABLE sessions; ALTER TABLE sessions_new RENAME TO sessions;

PRAGMA foreign_keys = ON;