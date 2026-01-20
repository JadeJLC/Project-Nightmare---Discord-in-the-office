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

func (r *userRepository) GetUserByEmail(email string) (*domain.User, error) {
	row := r.db.QueryRow("SELECT user_id, username, email, password, age, gender, firstname, lastname FROM users WHERE email = ?", email)
	user := &domain.User{}
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.Age, &user.Gender, &user.Firstname, &user.Lastname)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) GetUserByUsername(username string) (*domain.User, error) {
	row := r.db.QueryRow("SELECT user_id, username, email, password, age, gender, firstname, lastname FROM users WHERE username = ?", username)
	user := &domain.User{}
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.Age, &user.Gender, &user.Firstname, &user.Lastname)
	if err != nil {
		return nil, err
	}
	return user, nil
}