package services

import (
	"real-time-forum/internal/domain"
	"real-time-forum/internal/repositories"
)

type TopicService struct {
    repo *repositories.TopicRepo
}

func NewTopicService(r *repositories.TopicRepo) *TopicService {
    return &TopicService{repo: r}
}

func (s *TopicService) CreateTopic(catID, userID int, title string) error {
	return s.repo.Create(catID, title, userID)
}

func (s *TopicService) DeleteTopic(topicID int) error {
	return  s.repo.Delete(topicID)
}

func (s *TopicService) GetTopicById(topicID int) (*domain.Topic, error) {
	return s.repo.GetTopicById(topicID)
}

func (s *TopicService) GetTopicByTitle(title string) (*domain.Topic, error) {
	return s.repo.GetTopicByTitle(title)
}

func (s *TopicService) GetTopicsByAuthorID(authorID int) ([]*domain.Topic, error) {
	return s.repo.GetTopicsByAuthor(authorID)
}

func (s *TopicService) GetTopicsByCategory(catID int) ([]*domain.Topic, error) {
	return s.repo.GetTopicsByCategory(catID)
}