package handlers

import (
	"fmt"
	"log"
	"net/http"
	"real-time-forum/internal/domain"
	"real-time-forum/internal/services"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var wsClients = make(map[string]*websocket.Conn) // userID → socket
var wsMutex sync.Mutex


type WebSocketHandler struct {
    sessionService *services.SessionService
    chatService    *services.ChatService
	userService *services.UserService
    upgrader       websocket.Upgrader
}

func NewWebSocketHandler(ss *services.SessionService, cs *services.ChatService, us *services.UserService) *WebSocketHandler {
    return &WebSocketHandler{
        sessionService: ss,
        chatService:    cs,
		userService: us,
        upgrader: websocket.Upgrader{
            ReadBufferSize:  1024,
            WriteBufferSize: 1024,
            CheckOrigin: func(r *http.Request) bool {
                return true
            },
        },
    }
}

func (h *WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	
    userID, err := h.sessionService.GetUserIDFromRequest(r)

    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // 2. Upgrade HTTP → WebSocket
    conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("WS upgrade error:", err)
		http.Error(w, "WebSocket upgrade failed", http.StatusInternalServerError)
		return
	}


    wsMutex.Lock()
    wsClients[userID] = conn
    wsMutex.Unlock()
	h.broadcastPresence()
    
    go h.listen(userID, conn)
}

func (h *WebSocketHandler) listen(userID string, conn *websocket.Conn) {
    defer func() {
        wsMutex.Lock()
        delete(wsClients, userID)
        wsMutex.Unlock()
		h.broadcastPresence()

        conn.Close()
    }()

    for {
        var msg map[string]interface{}
        err := conn.ReadJSON(&msg)
        if err != nil {
            break
        }

        if msg["type"] == "private_message" {
            to := msg["to"].(string)
            content := msg["content"].(string)
            h.handlePrivateMessage(userID, to, content)
        }
    }
}

func (h *WebSocketHandler) broadcastPresence() {
    wsMutex.Lock()
    defer wsMutex.Unlock()

    users := make([]map[string]interface{}, 0)

    for userID := range wsClients {
        user, err := h.userService.GetUserByID(userID)
        if err != nil {
            continue
        }

        users = append(users, map[string]interface{}{
            "id":       user.ID,
            "username": user.Username,
            "image": user.Image,
        })
    }

    msg := map[string]interface{}{
        "type":  "presence_update",
        "users": users,
    }

    for _, conn := range wsClients {
        conn.WriteJSON(msg)
    }
}



func (h *WebSocketHandler) handlePrivateMessage(from, to string, content string) {
    // 1. Construire le message
    dm := domain.DM{
        SenderID:   from,
        ReceiverID: to,
        Content:    content,
        CreatedAt:  time.Now(),
    }

    // 2. Sauvegarde en DB
    if err := h.chatService.SaveDM(dm); err != nil {
        fmt.Println("Error saving DM:", err)
        return
    }

    // 3. Mise à jour de la conversation
    if err := h.chatService.UpdateConversation(from, to); err != nil {
        fmt.Println("Error updating conversation:", err)
    }

    fromUser, _ := h.userService.GetUserByID(from)
    toUser, _ := h.userService.GetUserByID(to)

    // 4. Construire le message WebSocket sortant
    outgoing := map[string]interface{}{
    "type":             "private_message",
    "sender_id":        from,
    "sender_username":  fromUser.Username,
    "receiver_id":      to,
    "receiver_username": toUser.Username,
    "content":          content,
    "created_at":       dm.CreatedAt,
}


    // 5. Envoi temps réel au destinataire
    wsMutex.Lock()
    if conn, ok := wsClients[to]; ok {
        conn.WriteJSON(outgoing)
    }

    // 6. Envoi temps réel à l’expéditeur
    if conn, ok := wsClients[from]; ok {
        conn.WriteJSON(outgoing)
    }
    wsMutex.Unlock()
}

