package domain

type Message struct {
	ID int `json:"post_id"`
	TopicID int `json:"topic_id"`
	CatID int `json:"cat_id"`
	Author User `json:"author"`
	Content string `json:"content"`
	Time string `json:"created_on"`
	Reactions string `json:"reactions"`
	TopicTitle string `json:"topic_title"`
}

type LastPost struct {
	ID int `json:"post_id"`
	TopicID int `json:"topic_id"`
	Author string `json:"author"`
	Content string `json:"content"`
	Time string `json:"created_on"`
	TopicTitle string `json:"topic_title"`
}

type MessageRepo interface {
	Create(topicID int, content string, author int) error
	Delete(postID int) error
	Edit(postID int, newMessage string) error
	GetMessagesByTopic(topicID int) ([]*Message, error)
	GetMessagesByAuthor(author int) ([]*Message, error)
	GetMessageByID(postID int) (*Message, error)
}