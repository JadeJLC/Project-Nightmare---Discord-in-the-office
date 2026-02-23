package handlers

import (
	"fmt"
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
    sessionService  *services.SessionService
    chatService     *services.ChatService
	userService     *services.UserService
    upgrader        websocket.Upgrader
    notifService    *services.NotificationService
    adminService    *services.AdminService
}

func NewWebSocketHandler(ss *services.SessionService, cs *services.ChatService, us *services.UserService, ns *services.NotificationService, as *services.AdminService) *WebSocketHandler {
    return &WebSocketHandler{
        sessionService: ss,
        chatService:    cs,
		userService: us,
        notifService: ns,
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
    userID, _, err := h.sessionService.GetUserIDFromRequest(r)
    if err != nil {
        log.Println("WS: impossible de récupérer l'userID :", err)
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
        logMsg := fmt.Sprintf("ERROR : Erreur dans la mise en place du WebSocket : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
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
    now := time.Now()
    dm := domain.DM{
        SenderID:   from,
        ReceiverID: to,
        Content:    content,
        CreatedAt:  now,
    }

    if err := h.chatService.SaveDM(dm); err != nil {
        logMsg := fmt.Sprintf("ERROR : Erreur dans la sauvegarde du message privé : %v", err)
        h.adminService.SaveLogToDatabase(logMsg)
        return
    }

    // 3. Mise à jour de la conversation
    if err := h.chatService.UpdateConversation(from, to); err != nil {
        logMsg := fmt.Sprintf("ERROR : Erreur dans la mise à jour de la conversation : %v", err)
        h.adminService.SaveLogToDatabase(logMsg)
    }

    fromUser, _ := h.userService.GetUserByID(from)
    toUser, _ := h.userService.GetUserByID(to)

    // 4. Construire le message WebSocket sortant
    outgoing := map[string]interface{}{
    "type":             "private_message",
    "sender_id":        from,
    "sender_username":  fromUser.Username,
    "sender_image": fromUser.Image,
    "receiver_id":      to,
    "receiver_username": toUser.Username,
    "content":          content,
    "created_at":       now.Format(time.RFC3339),
    }

    wsMutex.Lock()
    if conn, ok := wsClients[to]; ok {
        conn.WriteJSON(outgoing)
    }

    if conn, ok := wsClients[from]; ok {
        conn.WriteJSON(outgoing)
    }
    wsMutex.Unlock()

    msgNotif := fmt.Sprintf("<span class='notif-topic'>Nouveau message de %s</span>", fromUser.Username)
    h.handleNotifications(to, msgNotif, fmt.Sprintf("[DM:%v]", from))
}


func (h *WebSocketHandler) handleNotifications(receiverID, message, data string) {
    currentTime := time.Now().Format("02/01/2006 à 15:04:05")

    if err := h.notifService.AddNotification(receiverID, message, data); err != nil {
        logMsg := fmt.Sprintf("Erreur dans la sauvegarde de la notification de message privé : %v", err)
        h.adminService.SaveLogToDatabase(logMsg)
        return
    }

    outgoing := map[string]interface{}{
        "type":          "notification",
        "receiver_id":   receiverID,
        "notif_message": message,
        "notif_status":  "new",
        "time":          currentTime,
        "data":          data,
    }

    // Envoi en temps réel si l’utilisateur est connecté
    wsMutex.Lock()
    if conn, ok := wsClients[receiverID]; ok {
        conn.WriteJSON(outgoing)
    }
    wsMutex.Unlock()
}

func (h *WebSocketHandler) SendTopicNotification(receiverID, message, data string) {
    now := time.Now().Format(time.RFC3339)

    outgoing := map[string]interface{}{
        "type":          "notification",
        "receiver_id":   receiverID,
        "notif_message": message,
        "notif_status":  "new",
        "notif_time":    now,
        "notif_data":    data,
    }

    wsMutex.Lock()
    if conn, ok := wsClients[receiverID]; ok {
        conn.WriteJSON(outgoing)
    }
    wsMutex.Unlock()
}
