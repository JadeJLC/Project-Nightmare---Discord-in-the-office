package repositories

import (
	"database/sql"
	"real-time-forum/internal/domain"
)

type ReactionRepo struct {
	db *sql.DB
}

func NewReactionRepo(db *sql.DB) *ReactionRepo {
	return &ReactionRepo {db:db}
}

/*
* Ajoute une réaction à la base de données
*/
func (r *ReactionRepo) Add(postID, userID int, reaction string) error {
	_, err := r.db.Exec(`
	INSERT INTO reactions (post_id, user_id, reaction_type)
	VALUES (?, ?, ?)
	`, postID, userID, reaction)
	return err
}

/*
* Supprime une réaction de la base de données
*/
func (r *ReactionRepo) Delete(postID, userID int) error {
    _, err := r.db.Exec(`
        DELETE FROM reaction WHERE post_id = ? AND user_id ) ?
    `, postID, userID)
    return err
}

/*
* Récupère la liste de toutes les réactions sur un message particulier
*/
func (r *ReactionRepo) GetPostReactions(postID int) ([]*domain.Reaction, error) {
	rows, err := r.db.Query(`SELECT user_id, reaction_type 
    FROM reactions
    WHERE post_id = ?`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

    var reactions = []*domain.Reaction{}
	reaction := &domain.Reaction{}
	for rows.Next() {
		if err := rows.Scan(&reaction.UserID, &reaction.Type); err != nil {
			return nil, err
		}
		reactions = append(reactions, reaction)
	}
   
    return reactions, nil
}

/*
* Récupère la liste de tous les messages auxquels l'utilisateur a réagi
*/
func (r *ReactionRepo) GetUserReactions(userID int) ([]*domain.ReactionDisplay, error) {
	rows, err := r.db.Query(`SELECT
			r.post_id,
			r.reaction_type,
            m.topic_id,
            m.content,
            m.created_on,
			u.username,
            t.title
        FROM reactions r
		JOIN messages m ON r.post_id = m.post_id
        JOIN users u ON m.author = u.user_id
		JOIN topics t ON m.topic_id = t.topic_id
		WHERE r.user_id = ?`, userID)
	if err != nil {
		return nil, err
	}

	
	defer rows.Close()

    var reactions = []*domain.ReactionDisplay{}
	reaction := &domain.ReactionDisplay{}
	for rows.Next() {
		if err := rows.Scan(&reaction.PostID, &reaction.Type, &reaction.TopicID, &reaction.Content, &reaction.Time, &reaction.Author, &reaction.TopicTitle); err != nil {
			return nil, err
		}
		reactions = append(reactions, reaction)
	}
   
    return reactions, nil
}