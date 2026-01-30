package services

import (
	"fmt"
	"net/http"
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

func (s *SessionService) GetUserIDFromRequest(r *http.Request) (int, error) {
    // 1. Récupérer le cookie
    cookie, err := r.Cookie("auth_token")
    if err != nil {
        return 0, fmt.Errorf("no session cookie")
    }

    // 2. Utiliser ta fonction existante dans le repo
    userID, err := s.repo.GetUserIDByToken(cookie.Value)
    if err != nil {
        return 0, fmt.Errorf("invalid session token")
    }

    return userID, nil
}
