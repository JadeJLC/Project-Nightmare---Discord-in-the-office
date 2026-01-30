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

func (s *ReactionService) AddReaction(postID, userID int, reaction string) error {
	return s.repo.Add(postID, userID, reaction)
}

func (s *ReactionService) DeleteReaction(postID, userID int) error {
	return s.repo.Delete(postID, userID)
}

func (s *ReactionService) GetPostReactions(postID int) ([]*domain.Reaction, error) {
	return s.repo.GetPostReactions(postID)
}

func (s *ReactionService) GetUserReactions(userID int) ([]*domain.ReactionDisplay, error) {
	return s.repo.GetUserReactions(userID)
}