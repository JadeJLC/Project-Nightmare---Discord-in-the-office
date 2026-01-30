package domain

type Reaction struct {
	PostID int `json:"post_id"`
	UserID int `json:"user_id"`
	Type string `json:"reaction_type"`
}

type ReactionDisplay struct {
	
}

type ReactionRepo interface {
	Add(postID, userID int, reaction string) error
	Delete(postID, userID int) error
	GetPostReactions(postID int) ([]*Reaction, error)
	GetUserReactions(userID int) ([]*Reaction, error)
}