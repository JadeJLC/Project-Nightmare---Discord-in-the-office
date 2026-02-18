package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/internal/domain"
	"real-time-forum/internal/services"
	"strconv"
)

type NotificationHandler struct {
	sessionService *services.SessionService
	notifService *services.NotificationService
	userService    *services.UserService
	messageService *services.MessageService
	topicService *services.TopicService
	wsHandler *WebSocketHandler
}

func NewNotificationHandler(ss *services.SessionService, ns *services.NotificationService, us *services.UserService, ms *services.MessageService, ts *services.TopicService, ws *WebSocketHandler) *NotificationHandler {
    return &NotificationHandler{ss, ns, us, ms, ts, ws}
}


func (h *NotificationHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	userID, err := h.sessionService.GetUserIDFromRequest(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	notifications, err := h.notifService.GetNotificationList(userID)
	if err != nil {
		log.Print("Erreur dans le chargement des notifications : ", err)
		http.Error(w, "Error loading notifications", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

func (h *NotificationHandler) NotificationDatabase(w http.ResponseWriter, r *http.Request) {
	mode := r.URL.Query().Get("mode")

	if mode == "markasread" || mode == "delete" {
		notifID, err := strconv.Atoi(r.URL.Query().Get("notifID"))

		if err != nil {
		log.Print("Données invalides : ", err)
        http.Error(w, "Données invalides", http.StatusBadRequest)
        return
    	}

		switch mode {
		case "markasread":
			h.notifService.MarkNotifAsRead(notifID)
			break
		case "delete":
			h.notifService.DeleteNotification(notifID)
			break
		}
		return
	}

	if mode == "unfollow" {
		topicID, err := strconv.Atoi(r.URL.Query().Get("topicID"))

		if err != nil {
		log.Print("Données invalides : ", err)
        http.Error(w, "Données invalides", http.StatusBadRequest)
        return
    	}

		userID, err := h.sessionService.GetUserIDFromRequest(r)

		if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
		}

		h.topicService.UnfollowTopic(userID, topicID)
		return
	}

	if mode == "follow" {
		topicID, err := strconv.Atoi(r.URL.Query().Get("topicID"))

		if err != nil {
		log.Print("Données invalides : ", err)
        http.Error(w, "Données invalides", http.StatusBadRequest)
        return
    	}

		userID, err := h.sessionService.GetUserIDFromRequest(r)

		if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
		}

		h.topicService.FollowTopic(userID, topicID)
		return

	}

	var notifData domain.NewNotif
	
    if err := json.NewDecoder(r.Body).Decode(&notifData); err != nil {
		log.Print("Données invalides : ", err)
        http.Error(w, "Données invalides", http.StatusBadRequest)
        return
    }

	if notifData.Type == "newreply" {
		if r.Method != http.MethodPost {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }

		sender, err := h.userService.GetUserByUsername(notifData.SenderName)
		if err !=nil {
			log.Print("Erreur dans la récupération de l'envoyeur : ", notifData.SenderName, " - ", err)
			http.Error(w, "Erreur récupération sender", http.StatusInternalServerError)
			return
		}

		topicPosts, err := h.messageService.GetMessagesByTopic(notifData.TopicID)
		if err !=nil {
			log.Print("Erreur dans la récupération du lien du post : ", err)
			http.Error(w, "Erreur récupération sender", http.StatusInternalServerError)
			return
		}

		lastPost := topicPosts[len(topicPosts)-1]

		
		data := fmt.Sprintf("[TOPIC:%v][POST:%v][USER:%v]", notifData.TopicID, lastPost.ID, notifData.SenderName)
		h.notifService.GetTopicUsersToNotify(notifData.TopicID, sender.ID, notifData.NotifMessage, data)

		users, _ := h.notifService.GetTopicUsersToNotify(notifData.TopicID, sender.ID, notifData.NotifMessage, data)
		for _, u := range users {
			h.wsHandler.SendTopicNotification(
				u,
				notifData.NotifMessage,
				data,
			)
		}

	}
}