package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"real-time-forum/internal/services"
)

type ChatHandler struct {
    sessionService *services.SessionService
    chatService    *services.ChatService
}

func NewChatHandler(ss *services.SessionService, cs *services.ChatService) *ChatHandler {
    return &ChatHandler{
        sessionService: ss,
        chatService:    cs,
    }
}

func (h *ChatHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    userID, _, err := h.sessionService.GetUserIDFromRequest(r)
    if err != nil {
        if err == sql.ErrNoRows {
        http.Error(w, "Tentative d'accès au chat sans être connecté", http.StatusUnauthorized)
        } else {
            http.Error(w, "Erreur interne au serveur dans la récupération des utilisateurs", http.StatusInternalServerError)
        }
        return
    }

    otherID := r.URL.Query().Get("user")
    offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
    limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

    if limit == 0 {
        limit = 10
    }

    messages, err := h.chatService.GetDms(userID, otherID, offset, limit)
    if err != nil {
        http.Error(w, "Error loading messages", http.StatusInternalServerError)
        return
    }

    // 4. Retourner en JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(messages)
}
