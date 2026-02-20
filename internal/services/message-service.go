package services

import (
	"real-time-forum/internal/domain"
	"real-time-forum/internal/repositories"
)

type MessageService struct {
    repo *repositories.MessageRepo
}

func NewMessageService(r *repositories.MessageRepo) *MessageService {
    return &MessageService{repo: r}
}

func (s *MessageService) CreateMessage(topicID int, content string, userID string) error {
	return s.repo.Create(topicID, content, userID)
}

func (s *MessageService) DeleteMessage(topicID, postID int, mode, user string) error {
	return  s.repo.Delete(topicID, postID, mode, user)
}

func (s *MessageService) EditMessage(postID int, content string) error {
	return s.repo.Edit(postID, content)
}

func (s *MessageService) GetMessagesByTopic(topicID int) ([]*domain.Message, error) {
	return s.repo.GetMessagesByTopic(topicID)
}

func (s *MessageService) GetMessagesByAuthor(authorID string) ([]*domain.Message, error) {
	return s.repo.GetMessagesByAuthor(authorID)
}

func (s *MessageService) GetMessageByID(postID int) (*domain.Message, error) {
	return s.repo.GetMessageByID(postID)
}