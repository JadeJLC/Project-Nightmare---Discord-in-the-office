// internal/repositories/user_repository.go
package repositories

import (
	"database/sql"
	"log"
	"real-time-forum/internal/domain"
	"time"

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

    date := time.Now()

    res, err := r.db.Exec(`
        INSERT INTO users (username, email, password, age, gender, firstname, lastname, image, inscription)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        user.Username, user.Email, hashedPassword, user.Age, user.Gender, user.Firstname, user.Lastname, "Carla", date,
    )
    if err != nil {
        return err
    }
    id, err := res.LastInsertId()
    if err == nil {
        user.ID = id
    }
    return nil
}

func (r *userRepository) GetUserByEmail(email string) (*domain.User, error) {
    row := r.db.QueryRow(`
        SELECT user_id, username, email, password, age, gender, firstname, lastname
        FROM users WHERE email = ?`, email)

    user := &domain.User{}
    err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Password,
        &user.Age, &user.Gender, &user.Firstname, &user.Lastname)
    if err != nil {
        return nil, err
    }
    return user, nil
}

func (r *userRepository) GetUserByUsername(username string) (*domain.User, error) {
    row := r.db.QueryRow(`
        SELECT user_id, username, email, password, age, gender, firstname, lastname, image, inscription
        FROM users WHERE username = ?`, username)

    user := &domain.User{}
    err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Password,
        &user.Age, &user.Gender, &user.Firstname, &user.Lastname, &user.Image, &user.Inscription)
    if err != nil {
        return nil, err
    }
    return user, nil
}

func (r *userRepository) GetUserByToken(token string) (*domain.User, error) { 
	user := &domain.User{}
	err := r.db.QueryRow(`SELECT id, username FROM users WHERE token = ?`, token).Scan(&user.ID, &user.Username) 
	if err != nil {
        return nil, err
    }
	return user, nil 
}

func (r *userRepository) GetUserByID(id int) (*domain.User, error) { 
    user := &domain.User{}
    err := r.db.QueryRow(`
        SELECT user_id, username FROM users WHERE user_id = ?`, id).
        Scan(&user.ID, &user.Username)

    if err != nil {
        return nil, err
    }
    return user, nil 
}

func (r *userRepository) UpdateUserProfile(userID int, user *domain.User) error {
    log.Print(user)
    _, err := r.db.Exec(`
	UPDATE users SET email = ?, gender = ?, firstname = ?, lastname = ?
	WHERE user_id = ?
	`, user.Email, user.Gender, user.Firstname, user.Lastname, userID)

    return err
}