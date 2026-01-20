package service

/*
import (
	"real-time-forum/internal/domain"

	"golang.org/x/crypto/bcrypt"
)

type userService struct {
	repo domain.UserRepository
}

func NewUserService(repo domain.UserRepository) domain.UserService {
	return &userService{repo: repo}
}

func (s *userService) Register(user domain.User) error {
	/*
	existing, err := s.repo.GetUserByEmail(email)
	if err == nil && existing != nil {
		return errors.New("❌ email already registered")
	}
	existing2, err2 := s.repo.GetByUsername(username)
	if err2 == nil && existing2 != nil {
		return errors.New("❌ username already registered")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	return s.repo.Create(&user)
}*/