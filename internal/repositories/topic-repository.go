package repositories

import (
	"database/sql"
	"real-time-forum/internal/domain"
	"time"
)

type TopicRepo struct {
	db *sql.DB
}

func NewTopicRepo(db *sql.DB) domain.TopicRepo{
	return &TopicRepo{db: db}
}

func (r *TopicRepo) Create(category int, title string, authorId int) error {
	currentTime := time.Now()
	_, err := r.db.Exec(`
        INSERT INTO topics (category, title, created_on, author)
        VALUES (?, ?, ?, ?)
    `, category, title, currentTime, authorId)
    return err
}

func (r *TopicRepo) Delete(topicID int) error {
    _, err := r.db.Exec(`
        DELETE FROM topics WHERE topic_id = ?
    `, topicID)
    return err
}

func (r *TopicRepo) GetTopicById(topicID int) (*domain.Topic, error) {
	row := r.db.QueryRow(`
        SELECT category, title, created_on, author
        FROM topics WHERE id = ?`, topicID)

    topic := &domain.Topic{}
    err := row.Scan(&topic.CatID, &topic.Title, &topic.Time, &topic.Author)
    if err != nil {
        return nil, err
    }
    return topic, nil
}

func (r *TopicRepo) GetTopicByTitle(title string) (*domain.Topic, error) {
	row := r.db.QueryRow(`
        SELECT id, category, created_on, author
        FROM topics WHERE title = ?`, title)

    topic := &domain.Topic{}
    err := row.Scan(&topic.ID, &topic.CatID, &topic.Time, &topic.Author)
    if err != nil {
        return nil, err
    }
    return topic, nil
}

func (r *TopicRepo) GetTopicsByAuthor(authorID int) ([]*domain.Topic, error) {
	rows, err := r.db.Query(`SELECT topic_id, title, created_on 
    FROM topics 
    WHERE author = ?`, authorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

    var topics = []*domain.Topic{}
	topic := &domain.Topic{}
	for rows.Next() {
		if err := rows.Scan(&topic.ID, &topic.Title, &topic.Time); err != nil {
			return nil, err
		}
		topics = append(topics, topic)
	}
   
    return topics, nil
}

func (r *TopicRepo) GetTopicsByCategory(catID int) ([]*domain.Topic, error) {
	rows, err := r.db.Query(`SELECT topic_id, title, created_on, author 
    FROM topics 
    WHERE author = ?`, catID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

    var topics = []*domain.Topic{}
	topic := &domain.Topic{}
	for rows.Next() {
		if err := rows.Scan(&topic.ID, &topic.Title, &topic.Time, &topic.Author); err != nil {
			return nil, err
		}
		topics = append(topics, topic)
	}
   
    return topics, nil
}