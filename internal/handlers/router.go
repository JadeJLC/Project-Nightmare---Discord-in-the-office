// internal/handlers/router.go
package handlers

import (
	"net/http"
	"real-time-forum/internal/services"
)

/*
* Gestion des réponses et des éléments de serveur à appeler en fonction des requêtes API de la page javascript
 */
func Router(userService *services.UserService, sessionService *services.SessionService, chatService *services.ChatService, categService *services.CategoryService, topicService *services.TopicService, messageService *services.MessageService, reactionService *services.ReactionService, notifService *services.NotificationService) http.Handler {
    mux := http.NewServeMux()

    // Handlers instanciés proprement
    loginHandler := NewLoginHandler(userService, sessionService)
    registerHandler := NewRegisterHandler(userService, sessionService)
    homeHandler := NewHomeHandler(categService, topicService)
	meHandler := NewMeHandler(userService)
    logoutHandler := NewLogoutHandler(userService, sessionService)

    chatHandler := NewChatHandler(sessionService, chatService)
    conversationHandler := NewConversationHandler(sessionService, chatService, userService)
    wsHandler := NewWebSocketHandler(sessionService, chatService, userService, notifService)
    notificationHandler := NewNotificationHandler(sessionService, notifService, userService, messageService, topicService, wsHandler)

    
    profileHandler := NewProfileHandler(userService, messageService, reactionService, topicService)
    categoryHandler := NewCategoryHandler(userService, messageService, *categService, topicService)
    topicHandler := NewTopicHandler(messageService, topicService)
    postingHandler := NewPostHandler(messageService, topicService, userService, sessionService)

    // Routes
    mux.Handle("/", homeHandler)
    mux.Handle("/ws", wsHandler)
    mux.Handle("/api/login", loginHandler)
    mux.Handle("/api/logout", logoutHandler)
    mux.Handle("/api/register", registerHandler)
	mux.Handle("/api/me", meHandler)

    mux.Handle("/api/dm", chatHandler)
    mux.Handle("/api/conversations", conversationHandler)
    mux.Handle("/api/notifications", notificationHandler)
    mux.HandleFunc("/api/notif", notificationHandler.NotificationDatabase)

    mux.Handle("/api/profile", profileHandler)
    mux.Handle("/api/category", categoryHandler)
    mux.Handle("/api/topic", topicHandler)
    mux.Handle("/api/post", postingHandler)
    mux.HandleFunc("/api/avatars", profileHandler.GetAvatarList)


    // Assets
    fs := http.FileServer(http.Dir("./internal/templates/assets"))
    mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

    return mux
}
