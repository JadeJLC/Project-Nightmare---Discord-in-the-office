package config

import (
	"database/sql"

	"log"

	_ "modernc.org/sqlite"
)

func InitDB() *sql.DB {
	
	dbPath := "./database/forum.db" 
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatal("❌ error opening database:", err)
	}
	//vérification de la connexion:
	if err = db.Ping(); err != nil {
		log.Fatal("❌ error connecting to database:", err)
	} else {
		log.Printf("✅ connection to database succeded")
	}
	return db
}
