// internal/handlers/router.go
package handlers

import (
	"net/http"
	"real-time-forum/internal/services"
)

func Router(userService *services.UserService, sessionService *services.SessionService, categService *services.CategoryService, topicService *services.TopicService) http.Handler {
    mux := http.NewServeMux()

    // Handlers instanciés proprement
    loginHandler := NewLoginHandler(userService, sessionService)
    registerHandler := NewRegisterHandler(userService)
    homeHandler := NewHomeHandler(categService, topicService)
	meHandler := NewMeHandler(userService)
    logoutHandler := NewLogoutHandler(userService, sessionService)

    // Routes
    mux.Handle("/", homeHandler)
    mux.Handle("/api/login", loginHandler)
    mux.Handle("/api/logout", logoutHandler)
    mux.Handle("/api/register", registerHandler)
	mux.Handle("/api/me", meHandler)

    // Assets
    fs := http.FileServer(http.Dir("./internal/templates/assets"))
    mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

    return mux
}
