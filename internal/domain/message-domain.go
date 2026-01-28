package domain

type Message struct {
	ID int64 `json:"post_id"`
	TopicID int64 `json:"topic_id"`
	Author int `json:"author"`
	Content string `json:"content"`
	Time string `json:"created_on"`
	Reactions string `json:"reactions"`
}

type MessageRepo interface {
	Create(topicID int, content string, author int) error
	Delete(postID int) error
	Edit(postID int, newMessage string) error
	GetMessagesByTopic(topicID int) ([]*Message, error)
	GetMessagesByAuthor(author int) ([]*Message, error)
	GetMessageByID(postID int) (*Message, error)
}