package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
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
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'utilisateur connecté : %v", err)
		log.Print(logMsg)
		http.Error(w, logMsg, http.StatusUnauthorized)
		return
	}

	convs, err := h.chatService.GetConversations(userID)
	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans le chargement des conversations de l'utilisateur : %v", err)
		log.Print(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

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
		if err == sql.ErrNoRows {
			logMsg := fmt.Sprintf("LOG : L'utilisateur est introuvable ou la conversation inexistante : %v - %v", userID, otherID)
			log.Print(logMsg)
			http.Error(w, logMsg, http.StatusNotFound)
			return
		} else if err != nil {
			logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'autre utilisateur de la conversation : %v", err)
			log.Print(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
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
