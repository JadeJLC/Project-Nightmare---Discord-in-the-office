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
func (r *ReactionRepo) Add(postID int, userID, reaction string) error {
	_, err := r.db.Exec(`
	INSERT INTO reactions (post_id, user_id, reaction_type)
	VALUES (?, ?, ?)
	`, postID, userID, reaction)
	return err
}

/*
* Supprime une réaction de la base de données
*/
func (r *ReactionRepo) Delete(postID int, userID, reaction string) error {
    _, err := r.db.Exec(`
        DELETE FROM reactions 
        WHERE post_id = ? AND user_id = ? AND reaction_type = ?
    `, postID, userID, reaction)
    return err
}

/*
* Récupère la liste de tous les messages auxquels l'utilisateur a réagi
*/
func (r *ReactionRepo) GetUserReactions(userID string) ([]*domain.ReactionDisplay, error) {
	rows, err := r.db.Query(`SELECT
		r.post_id,
		r.reaction_type,
		m.topic_id,
		m.content,
		m.created_on,
		u.username,
		t.title,
		t.cat_id
	FROM reactions r
	JOIN messages m ON r.post_id = m.post_id
	JOIN users u ON m.author = u.user_id
	JOIN topics t ON m.topic_id = t.topic_id
	WHERE r.user_id = ?`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	messageMap := make(map[int]*domain.ReactionDisplay)
	for rows.Next() {
		var postID int
		var reactionType string
		var topicID, catID int
		var content, createdOn, username, title string

		if err := rows.Scan(&postID, &reactionType, &topicID, &content, &createdOn, &username, &title, &catID); err != nil {
			return nil, err
		}

		if messageMap[postID] == nil {
			messageMap[postID] = &domain.ReactionDisplay{
				PostID:     postID,
				UserID:     userID,
				Author:     username,
				Content:    content,
				Time:       createdOn,
				TopicTitle: title,
				TopicID:    topicID,
				CatID:      catID,
				Reactions:  []string{},
			}
		}

		messageMap[postID].Reactions = append(messageMap[postID].Reactions, reactionType)
	}

	var reactions []*domain.ReactionDisplay
	for _, message := range messageMap {
		reactions = append(reactions, message)
	}

	return reactions, nil
}

/*
* Récupère la liste de toutes les réactions d'un utilisateur sur un message particulier
*/
func (r *ReactionRepo) GetUserReactionsOnPost(postID int, userID string) ([]*domain.Reaction, error) {
	rows, err := r.db.Query(`SELECT reaction_type 
    FROM reactions
    WHERE post_id = ? AND user_id = ?`, postID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

    var reactions = []*domain.Reaction{}
	for rows.Next() {
	reaction := &domain.Reaction{}
		if err := rows.Scan(&reaction.Type); err != nil {
			return nil, err
		}
		reaction.PostID = postID
		reaction.UserID = userID
		reactions = append(reactions, reaction)
	}
   
    return reactions, nil
}
