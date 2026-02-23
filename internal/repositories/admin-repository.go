package repositories

import (
	"database/sql"
	"fmt"
	"real-time-forum/internal/domain"
	"regexp"
	"time"
)

type AdminRepo struct {
	db *sql.DB
}

func NewAdminRepo(db *sql.DB) *AdminRepo {
	return &AdminRepo {db:db}
}

func (r *AdminRepo) SaveLogToDatabase(log string) error {
	fmt.Printf("%v\n", log)
	newLog := r.ParseLog(log)
	currentTime := time.Now()

	_, err := r.db.Exec(`
	INSERT INTO logs (type, message, time)
	VALUES (?, ?, ?)
	`, newLog.Type, newLog.Message, currentTime)

	return err
}

func (r * AdminRepo) ParseLog(log string) domain.Log {
	var newLog domain.Log
	re := regexp.MustCompile(`^([A-Z]+)\s*:\s*(.*)$`)
	match := re.FindStringSubmatch(log)

	if len(match) == 3 {
		newLog.Type = match[1]
		newLog.Message = match[2]
	} else {
		newLog.Type = "LOG"
		newLog.Message = log
	}

	return newLog
}

func (r *AdminRepo) BanUser(userID string) error {
	_, err := r.db.Exec(`
        UPDATE users
        SET role = 4
        WHERE user_id = ?
    `, userID)
	return err
}

func (r *AdminRepo) UnbanUser(userID string) error {
	_, err := r.db.Exec(`
        UPDATE users
        SET role = 3
        WHERE user_id = ?
    `, userID)
	return err

}