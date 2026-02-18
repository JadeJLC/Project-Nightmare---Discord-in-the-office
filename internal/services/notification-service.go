package services

import (
	"real-time-forum/internal/domain"
	"real-time-forum/internal/repositories"
)

type NotificationService struct {
    repo *repositories.NotificationRepo
}

func NewNotificationService(r *repositories.NotificationRepo) *NotificationService {
    return &NotificationService{repo: r}
}

func (s *NotificationService) AddNotification(receiver, message, data string) (error) {
	return s.repo.AddNotification(receiver, message, data)
}

func (s *NotificationService) DeleteNotification(notifID int) (error) {
	return s.repo.DeleteNotification(notifID)
}

func (s *NotificationService) MarkNotifAsRead(notifID int) (error) {
	return s.repo.MarkAsRead(notifID)
}

func (s *NotificationService) GetNotificationList(receiverID string) ([]*domain.Notification, error) {
	return s.repo.GetNotificationList(receiverID)
}

func (s *NotificationService) GetTopicUsersToNotify(topicID int, senderID, message, data string) ([]string, error) {
	result, err := s.repo.GetTopicUsersToNotify(topicID, senderID, message, data)
	return result, err
}