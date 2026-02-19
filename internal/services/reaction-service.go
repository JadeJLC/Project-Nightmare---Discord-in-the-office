package services

import (
	"real-time-forum/internal/domain"
	"real-time-forum/internal/repositories"
)

type ReactionService struct {
    repo *repositories.ReactionRepo
}

func NewReactionService(r *repositories.ReactionRepo) *ReactionService {
    return &ReactionService{repo: r}
}

func (s *ReactionService) AddReaction(postID int, userID string, reaction string) error {
	return s.repo.Add(postID, userID, reaction)
}

func (s *ReactionService) DeleteReaction(postID int, userID, reaction string) error {
	return s.repo.Delete(postID, userID, reaction)
}

func (s *ReactionService) GetUserReactions(userID string) ([]*domain.ReactionDisplay, error) {
	return s.repo.GetUserReactions(userID)
}

func (s *ReactionService) GetUserReactionsOnPost(postID int, userID string) ([]*domain.Reaction, error) {
	return s.repo.GetUserReactionsOnPost(postID, userID)
}