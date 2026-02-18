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

/*
* Ajoute un nouveau message dans la base de données
*/
func (r *MessageRepo) Create(topicID int, content string, userID string) error {
	currentTime := time.Now()
	formattedTime := currentTime.Format("02/01/2006 à 15:04:05")
	_, err := r.db.Exec(`
	INSERT INTO messages (topic_id, author, content, created_on)
	VALUES (?, ?, ?, ?)
	`, topicID, userID, content, formattedTime)
	return err
}

/*
* Supprime le message demandé de la base de données
*/
func (r *MessageRepo) Delete(postID int) error {
    _, err := r.db.Exec(`
        DELETE FROM messages WHERE post_id = ?
    `, postID)
    return err
}

/*
* Modifie le contenu du message dans la base de données
*/
func (r *MessageRepo) Edit(postID int, newMessage string) error {
	_, err := r.db.Exec(`
	UPDATE messages SET content = ?
	WHERE post_id = ?
	`, newMessage, postID)
	return err
}


/*
* Récupère la liste complète des messages sur le sujet 
* Pour chaque message, récupère les informations du posteur
*/
func (r *MessageRepo) GetMessagesByTopic(topicID int) ([]*domain.Message, error) {
	rows, err := r.db.Query(`SELECT 
	m.post_id, 
	u.username,
	u.image,
	u.inscription,
	m.content, 
	m.created_on, 
	m.reactions
    FROM messages m
	LEFT JOIN users u ON m.author = u.user_id
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
	var username, image, inscription *string

		err := rows.Scan(
            &message.ID, 
            &username, 
            &image, 
            &inscription, 
            &message.Content, 
            &message.Time, 
            &message.Reactions,
        )
        if err != nil {
            return nil, err
        }

		if username == nil {
            message.Author.Username = "Inconnu"
            message.Author.Image = "Geoakim"
            message.Author.Inscription = "Membre supprimé"
        } else {
            message.Author.Username = *username
            message.Author.Image = *image
            message.Author.Inscription = *inscription
        }
		messages = append(messages, message)
	}
   
    return messages, nil
}

/*
* Récupère la liste de tous les messages postés par un utilisateur particulier, sur quel sujet et dans quelle catégorie
*/
func (r *MessageRepo) GetMessagesByAuthor(author string) ([]*domain.Message, error) {
	rows, err := r.db.Query(`SELECT
            m.post_id,
            m.topic_id,
            m.content,
            m.created_on,
			m.reactions,
            t.title,
			c.cat_id
        FROM messages m
        JOIN topics t ON m.topic_id = t.topic_id
		JOIN categories c ON t.cat_id = c.cat_id
		WHERE m.author = ?
		ORDER BY m.created_on DESC `, author)
	if err != nil {
		return nil, err
	}	
	defer rows.Close()

    var messages = []*domain.Message{}
	for rows.Next() {
	message := &domain.Message{}
		if err := rows.Scan(&message.ID, &message.TopicID, &message.Content, &message.Time, &message.Reactions, &message.TopicTitle, &message.CatID); err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}

   
    return messages, nil
}

/*
* Récupère un message particulier à partir de son ID
*/
func (r *MessageRepo) GetMessageByID(postID int) (*domain.Message, error) {
	row := r.db.QueryRow(`SELECT topic_id, author, content, created_on, reactions 
    FROM messages
    WHERE post_id = ?`, postID)

    message := &domain.Message{}
    err := row.Scan(&message.TopicID, &message.Author.ID, &message.Content, &message.Time, &message.Reactions)
    if err != nil {
        return nil, err
    }
    return message, nil
}
