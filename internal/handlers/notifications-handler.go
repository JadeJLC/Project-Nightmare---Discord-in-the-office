package handlers

import (
	"database/sql"
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
	userID, _, err := h.sessionService.GetUserIDFromRequest(r)
	if err != nil && err != sql.ErrNoRows {
		return
	}

	notifications, err := h.notifService.GetNotificationList(userID)
	if err != nil {
		logMSg := fmt.Sprintf("ERROR : Erreur dans le chargement des notifications : %v", err)
		log.Print(logMSg)
		http.Error(w, logMSg, http.StatusInternalServerError)
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
		logMsg := fmt.Sprintf("ERROR : Données de la notification invalides (%v) : %v", mode, err)
		log.Print(logMsg)
        http.Error(w, logMsg, http.StatusBadRequest)
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
			logMsg := fmt.Sprintf("ERROR : Données de la notification invalides (%v) : %v", mode, err)
			log.Print(logMsg)
        	http.Error(w, logMsg, http.StatusBadRequest)
        	return
    	}

		userID, _, err := h.sessionService.GetUserIDFromRequest(r)

		if err != nil {
			logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'utilisateur pour unfollow : %v", err)
			log.Print(logMsg)
			http.Error(w, logMsg, http.StatusUnauthorized)
			return
		}

		h.topicService.UnfollowTopic(userID, topicID)
		return
	}

	var notifData domain.NewNotif
	
    if err := json.NewDecoder(r.Body).Decode(&notifData); err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération des données de notification' : %v", err)
		log.Print(logMsg)
		http.Error(w, logMsg, http.StatusBadRequest)
        return
    }

	// if notifData.Type == "newreply"  {
	// 	if r.Method != http.MethodPost {
	// 	logMsg := fmt.Sprintf("ERROR : Méthode non autorisée pour l'envoi d'un nouveau message.")
	// 	log.Print(logMsg)
    //     http.Error(w, logMsg, http.StatusMethodNotAllowed)
    //     return
    // }

	sender, err := h.userService.GetUserByUsername(notifData.SenderName)
	if err !=nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'envoyeur de la notification : %v - %v ", notifData.SenderName, err)
		log.Print(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	if notifData.Type == "newreply" {
		topicPosts, err := h.messageService.GetMessagesByTopic(notifData.TopicID)
		if err !=nil {
			logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération du lien du post : %v", err)
			log.Print(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
			return
		}

		lastPost := topicPosts[len(topicPosts)-1]
		
		data := fmt.Sprintf("[TOPIC:%v][POST:%v][USER:%v]", notifData.TopicID, lastPost.ID, notifData.SenderName)
		h.notifService.GetTopicUsersToNotify(notifData.TopicID, sender.ID, notifData.NotifMessage, data)

		users, err := h.notifService.GetTopicUsersToNotify(notifData.TopicID, sender.ID, notifData.NotifMessage, data)
		if err != nil {
			logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de la liste des utilisateurs à notifier : %v", err)
			log.Print(logMsg)
			return
		}
		for _, u := range users {
			h.wsHandler.SendTopicNotification(
			u,
			notifData.NotifMessage,
			data,
			)
		}
	}
	// }
}
	
