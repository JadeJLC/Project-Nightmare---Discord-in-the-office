package handlers

import (
	"net/http"
	"real-time-forum/internal/domain"
)

func Router(ur domain.UserRepository) http.Handler{
	InitHandlers(ur)
	mux := http.NewServeMux()

	// Routes:
	mux.HandleFunc("/", HomeHandler)
	mux.HandleFunc("/api/register", RegisterHandler)

	fs := http.FileServer(http.Dir("./internal/templates/assets"))
	mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

	return mux
}
// Fonctions pour la gestion de l'url