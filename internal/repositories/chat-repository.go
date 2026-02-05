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
    return &ChatRepo{db: db}
}

func (r *ChatRepo) SaveDM(msg domain.DM) error {
    _, err := r.db.Exec(`
        INSERT INTO dms (sender_id, receiver_id, content, created_at)
        VALUES (?, ?, ?, ?)
    `, msg.SenderID, msg.ReceiverID, msg.Content, msg.CreatedAt)
    return err
}

func (r *ChatRepo) GetDMs(user1, user2, offset, limit int) ([]domain.DM, error) {
    rows, err := r.db.Query(`
        SELECT 
            d.id,
            d.sender_id,
            u1.username AS sender_username,
            d.receiver_id,
            u2.username AS receiver_username,
            d.content,
            d.created_at
        FROM dms d
        JOIN users u1 ON u1.user_id = d.sender_id
        JOIN users u2 ON u2.user_id = d.receiver_id
        WHERE (d.sender_id = ? AND d.receiver_id = ?)
           OR (d.sender_id = ? AND d.receiver_id = ?)
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
    `, user1, user2, user2, user1, limit, offset)

    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var dms []domain.DM

    for rows.Next() {
        var m domain.DM
        err := rows.Scan(
            &m.ID,
            &m.SenderID,
            &m.SenderName,
            &m.ReceiverID,
            &m.ReceiverName,
            &m.Content,
            &m.CreatedAt,
        )
        if err != nil {
            return nil, err
        }
        dms = append(dms, m)
    }

    return dms, nil
}


func (r *ChatRepo) UpdateConversation(user1, user2 int) error {
    now := time.Now()

    // Vérifie si la conversation existe
    var id int
    err := r.db.QueryRow(`
        SELECT id FROM conversations
        WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `, user1, user2, user2, user1).Scan(&id)

    if err == sql.ErrNoRows {
        // Créer une nouvelle conversation
        _, err = r.db.Exec(`
            INSERT INTO conversations (user1_id, user2_id, last_DM_at)
            VALUES (?, ?, ?)
        `, user1, user2, now)
        return err
    }

    // Sinon, mettre à jour
    _, err = r.db.Exec(`
        UPDATE conversations
        SET last_DM_at = ?
        WHERE id = ?
    `, now, id)
    return err
}

func (r *ChatRepo) GetConversations(userID int) ([]domain.Conversation, error) {
    rows, err := r.db.Query(`
        SELECT id, user1_id, user2_id, last_DM_at
        FROM conversations
        WHERE user1_id = ? OR user2_id = ?
        ORDER BY last_DM_at DESC
    `, userID, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var convs []domain.Conversation
    for rows.Next() {
        var c domain.Conversation
        err := rows.Scan(&c.ID, &c.User1ID, &c.User2ID, &c.LastMessageAt)
        if err != nil {
            return nil, err
        }
        convs = append(convs, c)
    }

    return convs, nil
}
