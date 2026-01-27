package domain

import "time"

type Topic struct {
	Id       int
	Category string
	Title     string
	Time     time.Time
	Author   string
}

type TopicRepo interface {
	Create(category, title string, authorId int) error
	Delete(title string) error
	GetTopicById(id int) (*Topic, error)
	GetTopicByTitle(title string) (*Topic, error)
}