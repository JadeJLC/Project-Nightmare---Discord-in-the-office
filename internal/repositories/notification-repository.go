package repositories

import (
	"database/sql"
	"log"
	"real-time-forum/internal/domain"
	"time"
)

type NotificationRepo struct {
	db *sql.DB
}

func NewNotificationRepo(db *sql.DB) *NotificationRepo {
	return &NotificationRepo {db:db}
}

/*
* Ajoute une notification dans la base de données
*/
func (r *NotificationRepo) AddNotification(receiver, message, data string) error {
	status := "new"
	currentTime := time.Now()
	_, err := r.db.Exec(`
	INSERT INTO notifications (receiver_id, message, time, status, data)
	VALUES (?, ?, ?, ?, ?)
	`, receiver, message,currentTime, status, data)
	return err
}

/*
* Ajoute une notification dans la base de données
*/
func (r *NotificationRepo) GetNotificationList(receiverID string) ([]*domain.Notification, error) {
	rows, err := r.db.Query(`
        SELECT notif_id, message, status, time, data
        FROM notifications
        WHERE receiver_id = ?
        ORDER BY time DESC
    `, receiverID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

	var notifications []*domain.Notification
    for rows.Next() {
        notif := &domain.Notification{}
        err := rows.Scan(&notif.ID, &notif.Message, &notif.Status, &notif.Time, &notif.Data)
        if err != nil {
            return nil, err
        }
        notifications = append(notifications, notif)
    }

    return notifications, nil
}

/*
* Marque une notification comme lue
*/
func (r *NotificationRepo) MarkAsRead(notifID int) error {
	status := "read"
	_, err := r.db.Exec(`
        UPDATE notifications
        SET status = ?
        WHERE notif_id = ?
    `, status, notifID)
	return err
}

/*
* Supprime une notification
*/
func (r *NotificationRepo) DeleteNotification(notifID int) error {
	 _, err := r.db.Exec(`
        DELETE FROM notifications WHERE notif_id = ?
		`, notifID)
	return err
}

/*
* Récupère la liste des utilisateurs d'un sujet pour envoyer une notification
* Exclut la personne qui vient d'envoyer le message
*/
func (r *NotificationRepo) GetTopicUsersToNotify(topicID int, senderID, message, data string) ([]string, error) {
    rows, err := r.db.Query(`
        SELECT DISTINCT u.user_id
        FROM users u
        JOIN messages m ON u.user_id = m.author
        LEFT JOIN mutedtopics tm ON u.user_id = tm.user_id AND m.topic_id = tm.topic_id
        WHERE m.topic_id = ? AND u.user_id != ?
        AND tm.user_id IS NULL;
    `, topicID, senderID)

    if err != nil {
        log.Print("Erreur dans le parcours de la BDD : ", err)
        return nil, err
    }
    defer rows.Close()

    var userlist = make([]string, 0, 10)

    for rows.Next() {
        var user string
        if err := rows.Scan(&user); err != nil {
            log.Print("Erreur dans la récupération d'un utilisateur : ", err)
            return nil, err
        }
        userlist = append(userlist, user)
    }

    if err = rows.Err(); err != nil {
        log.Print("Erreur dans la récupération des utilisateurs : ", err)
        return nil, err
    }

    // Ajout en BDD
    for _, user := range userlist {
        if err := r.AddNotification(user, message, data); err != nil {
            log.Print("Erreur dans l'ajout de la notification :", err)
            continue
        }
    }

    return userlist, nil
}
