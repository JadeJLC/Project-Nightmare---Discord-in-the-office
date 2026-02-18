package domain



type Notification struct {
	ID int `json:"notif_id"`
	Receiver string `json:"notif_receiver"`
	Message string `json:"notif_message"`
	Status string `json:"notif_status"`
	Time string `json:"notif_time"`
	Data string `json:"notif_data"`
}

type NewNotif struct {
	Type string `json:"notif_type"`
	TopicID int `json:"topic_id"`
	SenderName string `json:"sender_name"`
	NotifMessage string `json:"message"`

}

type NotificationRepo interface {
	AddNotification(receiver, message, data string) error
	MarkAsRead(notifID int) error
	DeleteNotification(notifID int) error
	GetTopicUsersToNotify(topicID int, senderID, message, data string) error
}