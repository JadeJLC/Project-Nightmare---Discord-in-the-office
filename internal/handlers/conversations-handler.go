package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time-forum/internal/domain"
	"real-time-forum/internal/services"
	"time"
)

type ConversationHandler struct {
	sessionService *services.SessionService
	chatService    *services.ChatService
	userService    *services.UserService
}

func NewConversationHandler(ss *services.SessionService, cs *services.ChatService, us *services.UserService) *ConversationHandler {
	return &ConversationHandler{ss, cs, us}
}

func (h *ConversationHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	userID, _, err := h.sessionService.GetUserIDFromRequest(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	convs, err := h.chatService.GetConversations(userID)
	if err != nil {
		log.Print("Erreur dans le chargement de la conversation : ", err)
		http.Error(w, "Error loading conversations", http.StatusInternalServerError)
		return
	}

	// enrichir avec infos utilisateur
	type ConvResponse struct {
		OtherUser domain.User `json:"otherUser"`
		LastAt    time.Time   `json:"lastMessageAt"`
	}

	var resp []ConvResponse

	for _, c := range convs {
		otherID := c.User1ID
		if otherID == userID {
			otherID = c.User2ID
		}

		otherUser, err := h.userService.GetUserByID(otherID)
		if err != nil {
			log.Println("Erreur GetUserByID:", err)
			http.Error(w, "Error loading user", http.StatusInternalServerError)
			return
		}
		if otherUser == nil {
			log.Println("Utilisateur introuvable:", otherID)
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		resp = append(resp, ConvResponse{
			OtherUser: *otherUser,
			LastAt:    c.LastMessageAt,
		})

	}


	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
