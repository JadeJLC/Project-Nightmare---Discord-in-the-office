package repositories

import (
	"database/sql"
	"real-time-forum/internal/domain"

	"golang.org/x/crypto/bcrypt"
)

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *domain.User) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	res, err := r.db.Exec("INSERT INTO users (username, email, password, age, gender, firstname, lastname) VALUES (?, ?, ?, ?, ?, ?, ?)",
		user.Username, user.Email, hashedPassword, user.Age, user.Gender, user.Firstname, user.Lastname)
	if err != nil {
		return err
	}
	// Récupérer l’ID auto-généré
	id, err := res.LastInsertId()
	if err == nil {
		user.ID = id
	}
	return nil
}