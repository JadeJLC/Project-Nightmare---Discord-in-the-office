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

func (s *MessageService) CreateMessage(topicID int, content string, author int) error {
	return s.repo.Create(topicID, content, author)
}

func (s *MessageService) DeleteMessage(postID int) error {
	return  s.repo.Delete(postID)
}

func (s *MessageService) EditMessage(topicID int, content string) error {
	return s.repo.Edit(topicID, content)
}

func (s *MessageService) GetMessagesByTopic(topicID int) ([]*domain.Message, error) {
	return s.repo.GetMessagesByTopic(topicID)
}

func (s *MessageService) GetMessagesByAuthor(authorID int) ([]*domain.Message, error) {
	return s.repo.GetMessagesByAuthor(authorID)
}

func (s *MessageService) GetMessageByID(postID int) (*domain.Message, error) {
	return s.repo.GetMessageByID(postID)
}