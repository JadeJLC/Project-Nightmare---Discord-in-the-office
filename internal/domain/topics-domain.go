package domain

type Topic struct {
	ID int `json:"topic_id"`
	CatID int `json:"category"`
	Title string `json:"title"`
	Time string `json:"created_on"`
	Author int `json:"author"`
	FirstPost string `json:"content"`
}



type TopicRepo interface {
	Create(category int, title string, authorId int) error
	GetTopicsByCategory(cat_id int) ([]*Topic, error)
	GetTopicsByAuthor(author int) ([]*Topic, error)
	GetTopicById(id int) (*Topic, error)
	GetTopicByTitle(title string) (*Topic, error)
	Delete(topic_ID int) error
}