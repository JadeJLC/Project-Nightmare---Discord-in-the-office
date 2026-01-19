package handlers

import "net/http"

func Router() http.Handler{
	mux := http.NewServeMux()

	// Routes:
	mux.HandleFunc("/", HomeHandler)

	fs := http.FileServer(http.Dir("../page/"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	return mux
}
// Fonctions pour la gestion de l'url