package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "modernc.org/sqlite"
)

const dbPath     = "./database/forum.db"
const schemaPath = "./database/schema.sql"

// InitDB initialise la base SQLite : vérifie ou recrée le schéma,
// configure la connexion et retourne la DB prête à l'emploi.
func InitDB() (*sql.DB, error) {
	dbExists := true
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		dbExists = false
	}

	recreateDB := false
	if !dbExists {
		recreateDB = true
	} else {
		expectedSchema := ExtractSql(schemaPath)
		if err := CompareDB(dbPath, expectedSchema); err != nil {
			fmt.Println("Schéma différent :", err)

			if err := BackupDB(dbPath); err != nil {
				fmt.Println("Backup non effectué :", err)
			}

			recreateDB = true
		}
	}

	if recreateDB {
		fmt.Println("Création d'une nouvelle base de données...")

		if dbExists {
			if err := os.Remove(dbPath); err != nil {
				return nil, fmt.Errorf("Erreur dans la suppression de la DB existante : %w", err)
			}
		}

		db, err := openAndConfigure(dbPath)
		if err != nil {
			return nil, err
		}

		schema, err := os.ReadFile(schemaPath)
		if err != nil {
			db.Close()
			return nil, fmt.Errorf("Erreur dans la lecture du schema sql : %w", err)
		}

		if _, err := db.Exec(string(schema)); err != nil {
			db.Close()
			return nil, fmt.Errorf("Erreur dans l'exécution du schema sql : %w", err)
		}

		fmt.Println("Base de données créée avec succès")
		DefaultDatabase(db)
		return db, nil
	}

	fmt.Println("DB correcte, aucun backup nécessaire")
	return openAndConfigure(dbPath)
}

// openAndConfigure ouvre la connexion SQLite et applique les PRAGMAs.
func openAndConfigure(path string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("❌ erreur ouverture de la base de données : %w", err)
	}

	if err = db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("❌ erreur de connexion à la base de données : %w", err)
	}

	log.Println("✅ Connexion à la base de données réussie")

	db.Exec("PRAGMA journal_mode=WAL;")
	db.Exec("PRAGMA busy_timeout = 5000;")

	return db, nil
}


