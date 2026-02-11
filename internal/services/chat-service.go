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

func (s *ChatService) GetDms(userID, otherID string, offset, limit int) ([]domain.DM, error) {
	return s.repo.GetDMs(userID, otherID, offset, limit)
}

func (s *ChatService) SaveDM(msg domain.DM) error {
	return s.repo.SaveDM(msg)
}

func (s *ChatService) UpdateConversation(user1, user2 string) error {
	return s.repo.UpdateConversation(user1, user2)
}

func (s *ChatService) GetConversations(userID string) ([]domain.Conversation, error) {
    return s.repo.GetConversations(userID)
}
