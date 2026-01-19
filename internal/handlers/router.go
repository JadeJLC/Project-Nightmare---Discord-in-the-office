package handlers

import "net/http"

func Router() http.Handler{
	mux := http.NewServeMux()

	// Routes:
	mux.HandleFunc("/", HomeHandler)

	fs := http.FileServer(http.Dir("./internal/templates/assets"))
	mux.Handle("/assets/", http.StripPrefix("/assets/", fs))

	return mux
}
// Fonctions pour la gestion de l'url