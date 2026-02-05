// internal/services/user_service.go
package services

import (
	"errors"
	"log"
	"real-time-forum/internal/domain"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
    repo domain.UserRepository
}

func NewUserService(repo domain.UserRepository) *UserService {
    return &UserService{repo: repo}
}

func (s *UserService) GetUserByID(id int) (*domain.User, error) { 
    return s.repo.GetUserByID(id) 
}

func (s *UserService) GetUserByUsername(username string) (*domain.User, error) { 
    return s.repo.GetUserByUsername(username) 
}

func (s *UserService) Register(user *domain.User) error {
    // Ici tu peux ajouter des règles métier si besoin
    return s.repo.Create(user)
}


func (s *UserService) Authenticate(authenticator, password string) (*domain.User, error) {
    var user *domain.User
    var err error

    if strings.Contains(authenticator, "@") {
        user, err = s.repo.GetUserByEmail(authenticator)
    } else {
        user, err = s.repo.GetUserByUsername(authenticator)
    }
    if err != nil {
        return nil, errors.New("invalid credentials")
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
        return nil, errors.New("invalid credentials")
    }

    return user, nil
}

func (s *UserService) GetProfile(searchedUser, loggedUser string) (*domain.User, error) {
    user, err := s.repo.GetUserByUsername(searchedUser)
    if err != nil {
        return &domain.User{Username: "No User Found"}, nil
    }

    user.Password = ""

    if searchedUser != loggedUser {
        user.Email = "Not Available"
    }

    return user, nil
}

func (s *UserService) EditProfile(newInfo domain.User) error {
    log.Print(newInfo)
    user, err := s.repo.GetUserByUsername(newInfo.Username)
    if err != nil {
       return err
    }
    return s.repo.UpdateUserProfile(int(user.ID), &newInfo)
}