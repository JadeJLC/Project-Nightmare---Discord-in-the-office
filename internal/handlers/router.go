// internal/handlers/router.go
package handlers

import (
	"net/http"
	"real-time-forum/internal/services"
)

func Router(userService *services.UserService) http.Handler {
    mux := http.NewServeMux()

    // Handlers instanciés proprement
    loginHandler := NewLoginHandler(userService)
    registerHandler := NewRegisterHandler(userService)
    homeHandler := NewHomeHandler()

    // Routes
    mux.Handle("/", homeHandler)
    mux.Handle("/api/login", loginHandler)
    mux.Handle("/api/register", registerHandler)

    // Assets
    fs := http.FileServer(http.Dir("./internal/templates/assets"))
    mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

    return mux
}
