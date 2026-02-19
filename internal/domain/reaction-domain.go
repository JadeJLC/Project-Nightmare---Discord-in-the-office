package domain

type Reaction struct {
	PostID int `json:"post_id"`
	UserID string `json:"user_id"`
	Type string `json:"reaction_type"`
	Count int `json:"reaction_count"`
}

type ReactionDisplay struct {
	PostID int `json:"post_id"`
	UserID string `json:"user_id"`
	Reactions []string `json:"reaction_list"`
	Author string `json:"author"`
	Content string `json:"content"`
	Time string `json:"created_on"`
	TopicTitle string `json:"topic_title"`
	TopicID int `json:"topic_id"`
	CatID int `json:"cat_id"`
}

type ReactionRepo interface {
	Add(postID, userID int, reaction string) error
	Delete(postID, userID int) error
	GetUserReactions(userID int) ([]*Reaction, error)
	GetUserReactionsOnPost(postID int, userID string) ([]*Reaction, error)
}