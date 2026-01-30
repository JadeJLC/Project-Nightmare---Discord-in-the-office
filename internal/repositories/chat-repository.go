package repositories

import (
	"database/sql"
	"real-time-forum/internal/domain"
	"time"
)

type ChatRepo struct {
	db *sql.DB
}

func NewChatRepo(db *sql.DB) *ChatRepo {
	return &ChatRepo {db:db}
}

func (r *ChatRepo) SaveDM(msg domain.DM) error {
    _, err := r.db.Exec(`
        INSERT INTO private_DMs (sender_id, receiver_id, content, created_at)
        VALUES (?, ?, ?, ?)
    `, msg.SenderID, msg.ReceiverID, msg.Content, msg.CreatedAt)
    return err
}

func (r *ChatRepo) GetDMs(user1, user2, offset, limit int) ([]domain.DM, error) {
    rows, err := r.db.Query(`
        SELECT id, sender_id, receiver_id, content, created_at
        FROM private_DMs
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `, user1, user2, user2, user1, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var dms []domain.DM
    for rows.Next() {
        var m domain.DM
        err := rows.Scan(&m.ID, &m.SenderID, &m.ReceiverID, &m.Content, &m.CreatedAt)
        if err != nil {
            return nil, err
        }
        dms = append(dms, m)
    }

    return dms, nil
}

func (r *ChatRepo) UpdateConversation(db *sql.DB, user1, user2 int) error {
    now := time.Now()

    // Vérifie si la conversation existe
    var id int
    err := db.QueryRow(`
        SELECT id FROM conversations
        WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `, user1, user2, user2, user1).Scan(&id)

    if err == sql.ErrNoRows {
        // Créer une nouvelle conversation
        _, err = db.Exec(`
            INSERT INTO conversations (user1_id, user2_id, last_DM_at)
            VALUES (?, ?, ?)
        `, user1, user2, now)
        return err
    }

    // Sinon, mettre à jour
    _, err = db.Exec(`
        UPDATE conversations
        SET last_DM_at = ?
        WHERE id = ?
    `, now, id)
    return err
}
