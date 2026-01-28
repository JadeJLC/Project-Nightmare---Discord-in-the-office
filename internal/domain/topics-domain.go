package domain


type Category struct {
	ID int64 `json:"id"`
	Name string `json:"name"`
	Description string `json:"description"`
}

type Topic struct {
	ID int64 `json:"topic_id"`
	CatID int64 `json:"category"`
	Title string `json:"title"`
	Created string `json:"created_on"`
	Author string `json:"author"`
}

type Message struct {
	ID int64 `json:"post_id"`
	TopicID int64 `json:"topic_id"`
	Author string `json:"author"`
	Content string `json:"content"`
	Created string `json:"created_on"`
	Reactions string `json:"reactions"`
}

type TopicRepository interface {
	GetCategoryById(id int) (*Category, error)
	GetTopicsByCategory(cat_id int) ([]*Topic, error)
	GetTopicById(id int) (*Topic, error)
	GetPostsByTopic(topic_id int) ([]*Message, error)
	GetPostByID(id int) (*Message, error)
}