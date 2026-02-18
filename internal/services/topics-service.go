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

func (s *TopicService) CreateTopic(catID int, userID, title string) error {
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

func (s *TopicService) GetTopicsByAuthorID(authorID string) ([]*domain.Topic, error) {
	return s.repo.GetTopicsByAuthor(authorID)
}

func (s *TopicService) GetTopicsByCategory(catID int) (*domain.TopicList, error) {
	return s.repo.GetTopicsByCategory(catID)
}

func (s *TopicService) GetTopicsByMostRecent(offset int) ([]*domain.LastPost, error) {
	return s.repo.GetTopicsByMostRecent(offset)
}

func (s *TopicService) UnfollowTopic(userID string, topicID int) error {
	return s.repo.MuteTopic(userID, topicID)
}

func (s *TopicService) FollowTopic(userID string, topicID int) error {
	return s.repo.UnmuteTopic(userID, topicID)
}