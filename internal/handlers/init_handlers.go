package handlers

import (
	"fmt"
	"html/template"
	"net/http"
	"path/filepath"
)

var templates *template.Template


func RenderTemplate(w http.ResponseWriter, tmpl string, datas any) {
	templates, _ = template.ParseGlob(filepath.Join("internal", "templates", "*.html"))
	err := templates.ExecuteTemplate(w, tmpl, datas)
	if err != nil {
		fmt.Printf("template error: %v\n", err)
		//http.Error(w, "❌ internal error: "+err.Error(), http.StatusInternalServerError)
		w.Write([]byte("❌ internal error: " + err.Error()))
	}
}