// internal/handlers/router.go
package handlers

import (
	"net/http"
	"real-time-forum/internal/services"
)

func Router(userService *services.UserService, sessionService *services.SessionService, categService *services.CategoryService, topicService *services.TopicService, messageService *services.MessageService, reactionService *services.ReactionService) http.Handler {
    mux := http.NewServeMux()

    // Handlers instanciés proprement
    loginHandler := NewLoginHandler(userService, sessionService)
    registerHandler := NewRegisterHandler(userService, sessionService)
    homeHandler := NewHomeHandler(categService, topicService)
	meHandler := NewMeHandler(userService)
    logoutHandler := NewLogoutHandler(userService, sessionService)
    profileHandler := NewProfileHandler(userService, messageService, reactionService, topicService)
    categoryHandler := NewCategoryHandler(userService, messageService, *categService, topicService)
    topicHandler := NewTopicHandler(messageService, topicService)

    // Routes
    mux.Handle("/", homeHandler)
    mux.Handle("/api/login", loginHandler)
    mux.Handle("/api/logout", logoutHandler)
    mux.Handle("/api/register", registerHandler)
	mux.Handle("/api/me", meHandler)
    mux.Handle("/api/profile", profileHandler)
    mux.Handle("/api/category", categoryHandler)
    mux.Handle("/api/topic", topicHandler)

    // Assets
    fs := http.FileServer(http.Dir("./internal/templates/assets"))
    mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

    return mux
}
