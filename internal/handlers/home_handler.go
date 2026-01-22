// internal/handlers/home_handler.go
package handlers

import "net/http"

type HomeHandler struct{}

func NewHomeHandler() *HomeHandler {
    return &HomeHandler{}
}

func (h *HomeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path != "/" {
        http.Error(w, "❌ not found", http.StatusNotFound)
        return
    }

    RenderTemplate(w, "index.html", nil)
}
