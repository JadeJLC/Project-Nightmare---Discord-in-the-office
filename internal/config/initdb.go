package config

import (
	"database/sql"
	"os"
	"path/filepath"

	"log"

	_ "modernc.org/sqlite"
)

func InitDB() *sql.DB {
	
	dbPath := "./database/forum.db" 
	db, err := sql.Open("sqlite", dbPath)
	absPath, _ := filepath.Abs(dbPath)
	log.Println("🔍 Le programme utilise ce fichier :", absPath)
	if err != nil {
		log.Fatal("❌ error opening database:", err)
	}
	//vérification de la connexion:
	if err = db.Ping(); err != nil {
		log.Fatal("❌ error connecting to database:", err)
	}

	if _, err = os.Stat(dbPath); os.IsNotExist(err) {
    	log.Println("ATTENTION : Le fichier forum.db n'a pas été trouvé au chemin :", dbPath)
	}
	// --- TEST DE DIAGNOSTIC ---
	var tableName string
	err = db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").Scan(&tableName)

	if err != nil {
		log.Println("❌ ALERTE : Le driver Go ne voit PAS la table 'users' dans ce fichier !")
		log.Printf("Détail de l'erreur : %v", err)
	} else {
		log.Printf("✅ CONFIRMATION : La table '%s' est bien accessible par Go.", tableName)
	}
	// --------------------------
	return db
}
