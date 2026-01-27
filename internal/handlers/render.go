// internal/handlers/render.go
package handlers

import (
	"fmt"
	"html/template"
	"net/http"
	"path/filepath"
)

func RenderTemplate(w http.ResponseWriter, tmpl string, datas any) {
    templates, _ := template.ParseGlob(filepath.Join("internal", "templates", "*.html"))
    err := templates.ExecuteTemplate(w, tmpl, datas)
    if err != nil {
        fmt.Printf("template error: %v\n", err)
        w.Write([]byte("❌ internal error: " + err.Error()))
    }
}
