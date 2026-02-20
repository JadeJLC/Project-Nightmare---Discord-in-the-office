package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
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
            logMsg := "ALERT : Tentative d'accès au chat par un utilisateur non connecté"
            log.Print(logMsg)
            http.Error(w, logMsg, http.StatusUnauthorized)
            return
        } else {
            logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération des utilisateurs : %v", err)
            log.Print(logMsg)
            http.Error(w, logMsg, http.StatusInternalServerError)
            return
        }
    }

    otherID := r.URL.Query().Get("user")
    offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
    limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

    if limit == 0 {
        limit = 10
    }

    messages, err := h.chatService.GetDms(userID, otherID, offset, limit)
    if err != nil {
        logMsg := fmt.Sprintf("ERROR : Erreur dans le chargement des messages privés : %v", err)
        log.Print(logMsg)
        http.Error(w, logMsg, http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(messages)
}
