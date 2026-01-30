// internal/handlers/router.go
package handlers

import (
	"net/http"
	"real-time-forum/internal/services"
)

func Router(userService *services.UserService, sessionService *services.SessionService, categService *services.CategoryService, topicService *services.TopicService, chatService *services.ChatService) http.Handler {
    mux := http.NewServeMux()

    // Handlers instanciés proprement
    loginHandler := NewLoginHandler(userService, sessionService)
    registerHandler := NewRegisterHandler(userService)
    homeHandler := NewHomeHandler(categService, topicService)
	meHandler := NewMeHandler(userService)
    logoutHandler := NewLogoutHandler(userService, sessionService)
    chatHandler := NewChatHandler(sessionService, chatService)
    wsHandler := NewWebSocketHandler(sessionService, chatService)

    

    // Routes
    mux.Handle("/", homeHandler)
    mux.Handle("/ws", wsHandler)
    mux.Handle("/api/login", loginHandler)
    mux.Handle("/api/logout", logoutHandler)
    mux.Handle("/api/register", registerHandler)
	mux.Handle("/api/me", meHandler)
    mux.Handle("/messages", chatHandler)

    // Assets
    fs := http.FileServer(http.Dir("./internal/templates/assets"))
    mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

    return mux
}
