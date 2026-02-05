// internal/handlers/home_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/services"
)

type HomeHandler struct{
    categoryService *services.CategoryService
    topicService *services.TopicService
}


func NewHomeHandler(cs *services.CategoryService, ts *services.TopicService) *HomeHandler {
    return &HomeHandler{categoryService: cs, topicService: ts,}
}

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
            http.Error(w, "Internal Server Error", http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(data)
        return
    }

    RenderTemplate(w, "index.html", nil)
}
