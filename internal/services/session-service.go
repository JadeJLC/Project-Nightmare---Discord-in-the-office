package services

import (
	"real-time-forum/internal/repositories"
	"time"
)

type SessionService struct {
    repo *repositories.SessionRepo
}

func NewSessionService(r *repositories.SessionRepo) *SessionService {
    return &SessionService{repo: r}
}

func (s *SessionService) CreateSession(userID int64, token string) error {
    expiration := time.Now().Add(24 * time.Hour)
    return s.repo.Create(userID, token, expiration)
}


func (s *SessionService) DeleteSession(token string) error {
    return s.repo.Delete(token)
}

func (s *SessionService) GetUserID(token string) (int, error) {
    return s.repo.GetUserIDByToken(token)
}
