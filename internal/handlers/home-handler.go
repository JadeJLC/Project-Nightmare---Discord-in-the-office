// internal/handlers/home_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/internal/services"
)

type HomeHandler struct{
    categoryService *services.CategoryService
    topicService    *services.TopicService
    adminService    *services.AdminService
}


func NewHomeHandler(cs *services.CategoryService, ts *services.TopicService, as *services.AdminService) *HomeHandler {
    return &HomeHandler{categoryService: cs, topicService: ts, adminService: as}
}

/*
* Affichage de la page d'accueil
* Récupère les derniers sujets ayant reçu un message si l'affichage est en mode "feed"
* Récupère la liste complète des catégories si l'affichage est en mode "catégories"
*/
func (h *HomeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path != "/" {
        http.Error(w, "❌ not found", http.StatusNotFound)
        return
    }

    mode := r.URL.Query().Get("mode")

    if mode != "" {
        var data interface{}
        var err error

        if mode == "feed" {
            data, err = h.topicService.GetTopicsByMostRecent(0)
        } else {
            data, err = h.categoryService.GetAllCategories()
        }

        if err != nil {
            logMsg := fmt.Sprintf("ERROR : Erreur dans le chargement de la page d'accueil : %v", err)
            h.adminService.SaveLogToDatabase(logMsg)
            http.Error(w, logMsg, http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(data)
        return
    }

    RenderTemplate(w, "index.html", nil, h.adminService)
}
