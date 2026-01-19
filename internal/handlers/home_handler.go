package handlers

import "net/http"

type Datas struct {

}

func HomeHandler(w http.ResponseWriter, r *http.Request) {

	if r.URL.Path != "/" {
		http.Error(w, "❌ not found", http.StatusNotFound)
		return
	}
	var datas Datas
	RenderTemplate(w, "index.html", datas)
}