// internal/handlers/render.go
package handlers

import (
	"fmt"
	"html/template"
	"net/http"
	"path/filepath"
	"real-time-forum/internal/services"
)

/*
* Affiche la page de base à partir du template
 */
func RenderTemplate(w http.ResponseWriter, tmpl string, datas any, adminService *services.AdminService) {
    templates, _ := template.ParseGlob(filepath.Join("internal", "templates", "*.html"))
    err := templates.ExecuteTemplate(w, tmpl, datas)
    if err != nil {
        logMsg := fmt.Sprintf("ERROR : Erreur dans la génération du template HTML : %v", err)
        adminService.SaveLogToDatabase(logMsg)
        w.Write([]byte("❌ internal error: " + err.Error()))
    }
}
