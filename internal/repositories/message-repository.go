package repositories

import (
	"database/sql"
	"log"
	"real-time-forum/internal/domain"
	"time"
)

type MessageRepo struct {
	db *sql.DB
}

func NewMessageRepo(db *sql.DB) *MessageRepo {
	return &MessageRepo {db:db}
}

func (r *MessageRepo) Create(topicID int, content string, author int) error {
	currentTime := time.Now()
	_, err := r.db.Exec(`
	INSERT INTO messages (topic_id, author, content, created_on)
	VALUES (?, ?, ?, ?)
	`, topicID, author, content, currentTime)
	return err
}

func (r *MessageRepo) Delete(postID int) error {
    _, err := r.db.Exec(`
        DELETE FROM messages WHERE post_id = ?
    `, postID)
    return err
}

func (r *MessageRepo) Edit(postID int, newMessage string) error {
	_, err := r.db.Exec(`
	UPDATE messages SET content = ?
	WHERE post_id = ?
	`, newMessage, postID)
	return err
}

func (r *MessageRepo) GetMessagesByTopic(topicID int) ([]*domain.Message, error) {
	rows, err := r.db.Query(`SELECT 
	m.post_id, 
	u.username,
	u.image,
	u.age,
	u.inscription,
	m.content, 
	m.created_on, 
	m.reactions
    FROM messages m
	JOIN users u ON m.author = u.user_id
	JOIN topics t ON m.topic_id = t.topic_id
    WHERE m.topic_id = ?`, topicID)
	if err != nil {
		log.Print("Erreur dans la récupération des messages du sujet : ", err)
		return nil, err
	}
	defer rows.Close()


    var messages = []*domain.Message{}
	for rows.Next() {
	message := &domain.Message{}
		if err := rows.Scan(&message.ID, &message.Author.Username, &message.Author.Image, &message.Author.Age, &message.Author.Inscription, &message.Content, &message.Time, &message.Reactions); err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
   
    return messages, nil
}

func (r *MessageRepo) GetMessagesByAuthor(author int) ([]*domain.Message, error) {
	rows, err := r.db.Query(`SELECT
            m.post_id,
            m.topic_id,
            m.content,
            m.created_on,
			m.reactions,
            t.title
        FROM messages m
        JOIN topics t ON m.topic_id = t.topic_id
		WHERE m.author = ? `, author)
	if err != nil {
		return nil, err
	}	
	defer rows.Close()

    var messages = []*domain.Message{}
	for rows.Next() {
	message := &domain.Message{}
		if err := rows.Scan(&message.ID, &message.TopicID, &message.Content, &message.Time, &message.Reactions, &message.TopicTitle); err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
   
    return messages, nil
}

func (r *MessageRepo) GetMessageByID(postID int) (*domain.Message, error) {
	row := r.db.QueryRow(`SELECT topic_id, author, content, created_on, reactions 
    FROM messages
    WHERE post_id = ?`, postID)

    message := &domain.Message{}
    err := row.Scan(&message.TopicID, &message.Author, &message.Content, &message.Time, &message.Reactions)
    if err != nil {
        return nil, err
    }
    return message, nil
}