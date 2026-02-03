package domain

type Topic struct {
	ID int `json:"topic_id"`
	CatID int `json:"cat_id"`
	Title string `json:"topic_title"`
	Time string `json:"created_on"`
	Author string `json:"author"`
	PostList []*Message `json:"post_list"`
	FirstPost string `json:"content"`
}

type TopicList struct {
	CatName string `json:"cat_name"`
	Topics []*Topic `json:"topic_list"`
}


type TopicRepo interface {
	Create(category int, title string, authorId int) error
	GetTopicsByCategory(cat_id int) ([]*Topic, error)
	GetTopicsByAuthor(author int) ([]*Topic, error)
	GetTopicById(id int) (*Topic, error)
	GetTopicByTitle(title string) (*Topic, error)
	Delete(topic_ID int) error
}