package repositories

import (
	"database/sql"
	"real-time-forum/internal/domain"
	"time"
)

type topicRepo struct {
	db *sql.DB
}

func NewTopicRepo(db *sql.DB) domain.TopicRepo{
	return &topicRepo{db: db}
}

func (r *topicRepo) Create(category, title string, authorId int) error {
	currentTime := time.Now()
	_, err := r.db.Exec(`
        INSERT INTO topics (category, title, created_on, author)
        VALUES (?, ?, ?, ?)
    `, category, title, currentTime, authorId)
    return err
}

func (r *topicRepo) Delete(title string) error {
    _, err := r.db.Exec(`
        DELETE FROM topics WHERE title = ?
    `, title)
    return err
}

func (r *topicRepo) GetTopicById(id int) (*domain.Topic, error) {
	row := r.db.QueryRow(`
        SELECT category, title, created_on, author
        FROM topics WHERE id = ?`, id)

    topic := &domain.Topic{}
    err := row.Scan(&topic.Category, &topic.Title, &topic.Time, &topic.Author)
    if err != nil {
        return nil, err
    }
    return topic, nil
}

func (r *topicRepo) GetTopicByTitle(title string) (*domain.Topic, error) {
	row := r.db.QueryRow(`
        SELECT id, category, created_on, author
        FROM topics WHERE title = ?`, title)

    topic := &domain.Topic{}
    err := row.Scan(&topic.Id, &topic.Category, &topic.Time, &topic.Author)
    if err != nil {
        return nil, err
    }
    return topic, nil
}