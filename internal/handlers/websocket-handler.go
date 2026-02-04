package handlers

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/services"
	"sync"

	"github.com/gorilla/websocket"
)

var wsClients = make(map[int]*websocket.Conn) // userID → socket
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
	fmt.Println("WS endpoint hit")
    // 1. Authentifier l’utilisateur via le 
	
    userID, err := h.sessionService.GetUserIDFromRequest(r)
	fmt.Println("WS userID:", userID, "err:", err)

    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // 2. Upgrade HTTP → WebSocket
    conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("WS upgrade error:", err)
		http.Error(w, "WebSocket upgrade failed", http.StatusInternalServerError)
		return
	}


    // 3. Stocker la connexion
    wsMutex.Lock()
    wsClients[userID] = conn
    wsMutex.Unlock()
	h.broadcastPresence()
    // 4. Lancer l’écoute des messages
    go h.listen(userID, conn)
}

func (h *WebSocketHandler) listen(userID int, conn *websocket.Conn) {
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
            to := int(msg["to"].(float64))
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



func (h *WebSocketHandler) handlePrivateMessage(from, to int, content string) {
    // Ici on fera :
    // 1. Sauvegarde en DB
    // 2. Update conversation
    // 3. Envoi temps réel au destinataire
    // 4. Envoi temps réel à l’expéditeur
}
