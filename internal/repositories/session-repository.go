package repositories

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type SessionRepo struct {
	db *sql.DB
}

func NewSessionRepo(db *sql.DB) *SessionRepo {
	return &SessionRepo{db: db}
}

// Crée une nouvelle session, ajoute le cookie dans la base de données
func (r *SessionRepo) Create(userID string, token string, expiration time.Time) error {
	_, err := r.db.Exec(`
        INSERT INTO sessions (id, user_id, data, expiration)
        VALUES (?, ?, ?, ?)
    `, uuid.NewString(), userID, token, expiration)
	return err
}

// Déconnecte, supprime la session de la base de données
func (r *SessionRepo) Delete(token string) error {
	_, err := r.db.Exec(`
        DELETE FROM sessions WHERE data = ?
    `, token)
	return err
}

// Récupère l'ID de l'utilisateur à connecter à partir d'un token dans la BDD
func (r *SessionRepo) GetUserIDByToken(token string) (string, string, error) {
	var userID string
	var userRole string
	err := r.db.QueryRow(`
        SELECT s.user_id,
		u.role
		FROM sessions s 
		JOIN users u ON s.user_id = u.user_id
		WHERE data = ?
    `, token).Scan(&userID, &userRole)
	return userID, userRole, err
}