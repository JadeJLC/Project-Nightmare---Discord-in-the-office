package repositories

import (
	"database/sql"
	"time"
)

type SessionRepo struct {
    db *sql.DB
}

func NewSessionRepo(db *sql.DB) *SessionRepo {
    return &SessionRepo{db: db}
}

/*
* Crée une nouvelle session, ajoute le cookie dans la base de données
*/
func (r *SessionRepo) Create(userID int64, token string, expiration time.Time) error {
    _, err := r.db.Exec(`
        INSERT INTO sessions (user_id, data, expiration)
        VALUES (?, ?, ?)
    `, userID, token, expiration)
    return err
}

/*
* Déconnecte, supprime la session de la base de données
*/
func (r *SessionRepo) Delete(token string) error {
    _, err := r.db.Exec(`
        DELETE FROM sessions WHERE data = ?
    `, token)
    return err
}

/*
* Récupère l'ID de l'utilisateur à connecter à partir d'un token dans la BDD
*/
func (r *SessionRepo) GetUserIDByToken(token string) (int, error) {
    var userID int
    err := r.db.QueryRow(`
        SELECT user_id FROM sessions WHERE data = ?
    `, token).Scan(&userID)
    return userID, err
}
