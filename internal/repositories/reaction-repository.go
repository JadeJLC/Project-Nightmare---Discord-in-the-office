package repositories

import (
	"database/sql"
	"real-time-forum/internal/domain"
)

type ReactionRepo struct {
	db *sql.DB
}

func NewReactionRepo(db *sql.DB) domain.ReactionRepo {
	return &ReactionRepo {db:db}
}

func (r *ReactionRepo) Add(postID, userID int, reaction string) error {
	_, err := r.db.Exec(`
	INSERT INTO reactions (post_id, user_id, reaction_type)
	VALUES (?, ?, ?)
	`, postID, userID, reaction)
	return err
}

func (r *ReactionRepo) Delete(postID, userID int) error {
    _, err := r.db.Exec(`
        DELETE FROM reaction WHERE post_id = ? AND user_id ) ?
    `, postID, userID)
    return err
}

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

func (r *ReactionRepo) GetUserReactions(userID int) ([]*domain.Reaction, error) {
	rows, err := r.db.Query(`SELECT post_id, reaction_type 
    FROM reactions
    WHERE user_id = ?`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

    var reactions = []*domain.Reaction{}
	reaction := &domain.Reaction{}
	for rows.Next() {
		if err := rows.Scan(&reaction.PostID, &reaction.Type); err != nil {
			return nil, err
		}
		reactions = append(reactions, reaction)
	}
   
    return reactions, nil
}