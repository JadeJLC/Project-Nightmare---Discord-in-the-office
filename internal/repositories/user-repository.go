// internal/repositories/user_repository.go
package repositories

import (
	"database/sql"
	"html/template"
	"real-time-forum/internal/domain"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func cleanUserInput (user *domain.User)  {
   user.Firstname = template.HTMLEscapeString(strings.TrimSpace(user.Firstname))
   user.Lastname  = template.HTMLEscapeString(strings.TrimSpace(user.Lastname))
   user.Email     = template.HTMLEscapeString(strings.TrimSpace(user.Email))
   user.Gender    = template.HTMLEscapeString(strings.TrimSpace(user.Gender))
}

/*
* Ajoute un utilisateur dans la base de données en sécurisant les éléments envoyés
*/
func (r *UserRepository) Create(user *domain.User) error {
    cleanUserInput(user)

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    
    user.ID = uuid.New().String()

    date := time.Now()
    formattedTime := date.Format("02/01/2006")

    role, err := r.CheckIfFirstUser()

    _, err = r.db.Exec(`
        INSERT INTO users (user_id, username, email, password, age, gender, firstname, lastname, image, inscription, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        user.ID, user.Username, user.Email, hashedPassword, user.Age, user.Gender, user.Firstname, user.Lastname, "Carla", formattedTime, role,
    )
    if err != nil {
        return err
    }
    
    return nil
}

func (r *UserRepository) CheckIfFirstUser() (int, error) {
    var count int
	role := 3
	err := r.db.QueryRow("SELECT COUNT(*) FROM user").Scan(&count)

	if err != nil && err != sql.ErrNoRows {
		return role, err
	}

	if count == 0 {
        return 0, nil
	}

    return role, nil
}

/*
* Récupère les informations d'un utilisateur à partir de son email
*/
func (r *UserRepository) GetUserByEmail(email string) (*domain.User, error) {
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

/*
* Récupère les informations d'un utilisateur à partir de son pseudo
*/
func (r *UserRepository) GetUserByUsername(username string) (*domain.User, error) {
    row := r.db.QueryRow(`
        SELECT user_id, username, email, password, age, gender, firstname, lastname, image, inscription, role
        FROM users WHERE username = ?`, username)

    user := &domain.User{}
    err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Password,
        &user.Age, &user.Gender, &user.Firstname, &user.Lastname, &user.Image, &user.Inscription, &user.Role)
    if err != nil {
        return nil, err
    }
    return user, nil
}

/*
* Récupère les informations d'un utilisateur à partir des tokens de connexion
*/
func (r *UserRepository) GetUserByToken(token string) (*domain.User, error) { 
	user := &domain.User{}
	err := r.db.QueryRow(`SELECT id, username, image FROM users WHERE token = ?`, token).Scan(&user.ID, &user.Username, &user.Image) 
	if err != nil {
        return nil, err
    }
	return user, nil 
}

func (r *UserRepository) GetUserByID(id string) (*domain.User, error) { 
    user := &domain.User{}
    err := r.db.QueryRow(`
        SELECT user_id, username, image, role FROM users WHERE user_id = ?`, id).
        Scan(&user.ID, &user.Username, &user.Image, &user.Role)

    if err != nil {
        return nil, err
    }
    return user, nil 
}

func (r *UserRepository) UpdateUserProfile(userID string, user *domain.User) error {
    cleanUserInput(user)
    _, err := r.db.Exec(`
	UPDATE users SET email = ?, gender = ?, firstname = ?, lastname = ?
	WHERE user_id = ?
	`, user.Email, user.Gender, user.Firstname, user.Lastname, userID)

    return err
}

func (r *UserRepository) UpdateUserImage(username, image string) error {
    _, err := r.db.Exec(`
	UPDATE users SET image = ?
	WHERE username = ?
	`, image, username)

    return err
}

func (r *UserRepository) GetUserList(onlineUsers map[string]bool) ([]*domain.User, error) {
   rows, err := r.db.Query(`SELECT user_id, username, image 
        FROM users 
        ORDER BY username ASC`)
	if err != nil {
		return nil, err
	}	
	defer rows.Close()

    var users []*domain.User
	for rows.Next() {
	user := &domain.User{}
		if err := rows.Scan(&user.ID, &user.Username, &user.Image); err != nil {
			return nil, err
		}
    if !onlineUsers[user.Username] {
            users = append(users, user)
    }

	}

    return users, nil
}