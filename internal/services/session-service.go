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

func (s *SessionService) CreateSession(userID string, token string) error {
    expiration := time.Now().Add(24 * time.Hour)
    return s.repo.Create(userID, token, expiration)
}


func (s *SessionService) DeleteSession(token string) error {
    return s.repo.Delete(token)
}

func (s *SessionService) GetUserID(token string) (string, string, error) {
    return s.repo.GetUserIDByToken(token)
}

func (s *SessionService) GetUserIDFromRequest(r *http.Request) (string, string, error) {
    // 1. Récupérer le cookie
    cookie, err := r.Cookie("auth_token")
    if err != nil {
        return "", "", fmt.Errorf("no session cookie")
    }

    // 2. Utiliser ta fonction existante dans le repo
    userID, userRole, err := s.repo.GetUserIDByToken(cookie.Value)
    if err != nil {
        return "", "", fmt.Errorf("invalid session token")
    }

    return userID, userRole, nil
}
