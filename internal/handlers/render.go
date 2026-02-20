// internal/handlers/render.go
package handlers

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"path/filepath"
)

/*
* Affiche la page de base à partir du template
 */
func RenderTemplate(w http.ResponseWriter, tmpl string, datas any) {
    templates, _ := template.ParseGlob(filepath.Join("internal", "templates", "*.html"))
    err := templates.ExecuteTemplate(w, tmpl, datas)
    if err != nil {
        logMsg := fmt.Sprintf("ERROR : Erreur dans la génération du template HTML : %v", err)
        log.Print(logMsg)
        w.Write([]byte("❌ internal error: " + err.Error()))
    }
}
