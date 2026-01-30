package services

import (
	"real-time-forum/internal/domain"
	"real-time-forum/internal/repositories"
)

type ChatService struct {
	repo *repositories.ChatRepo
}

func NewChatService(repo *repositories.ChatRepo) *ChatService {
	return &ChatService{repo}
}

func (s *ChatService) GetMessages(userID, otherID, offset, limit int) ([]domain.DM, error) {
	return s.repo.GetDMs(userID, otherID, offset, limit)
}
