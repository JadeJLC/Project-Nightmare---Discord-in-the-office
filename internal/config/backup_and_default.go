package config

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
)

// BackupDB crée une copie du fichier DB existant.
func BackupDB(dbPath string) error {
		backupPath := "./database/backup_forum.db"

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		return nil 
	}

	srcFile, err := os.Open(dbPath)
	if err != nil {
		return fmt.Errorf("Erreur dans l'ouverture du fichier source : %w", err)
	}
	defer srcFile.Close()

	dstFile, err := os.Create(backupPath)
	if err != nil {
		return fmt.Errorf("Erreur dans la création du fichier backup : %w", err)
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	if err != nil {
		return fmt.Errorf("Erreur dans la copie des données : %w", err)
	}

	fmt.Println("Backup créé :", backupPath)
	return nil
}


// DefaultDatabase insère les données par défaut (rôles et catégories).
func DefaultDatabase(db *sql.DB) {
	if db == nil {
		log.Print("Database connection is nil.")
		return
	}

	execAndLog := func(query string, args ...any) {
		_, err := db.Exec(query, args...)
		if err != nil {
			if strings.Contains(err.Error(), "UNIQUE constraint failed") {
				fmt.Println("AVERTISSEMENT : Insertion ignorée : entrée déjà existante.")
			} else {
				log.Printf("Erreur fatale lors de l'insertion: %v\n", err)
				panic(err)
			}
		}
	}

	log.Println("INIT : Création des rôles par défaut")
	execAndLog(`INSERT INTO roles (role_name) VALUES (?)`, "ADMIN")
	execAndLog(`INSERT INTO roles (role_name) VALUES (?)`, "MODO")
	execAndLog(`INSERT INTO roles (role_name) VALUES (?)`, "MEMBRE")
	execAndLog(`INSERT INTO roles (role_name) VALUES (?)`, "BANNI")

	log.Println("INIT : Création des catégories par défaut")
	execAndLog(
		`INSERT INTO categories (name, description) VALUES (?, ?)`,
		"Règles et explications",
		"Toute communauté se doit d'avoir quelques règles pour la bonne entente et l'organisation. Vous pouvez consulter ici celles de Project Nightmare&nbsp;: Discord in the Office. Vous y trouverez aussi des informations sur la licence Project Nigthmare.",
	)
	execAndLog(
		`INSERT INTO categories (name, description) VALUES (?, ?)`,
		"News des développeurs",
		"Ici, nous vous tiendrons au courant de toutes les nouveautés concernant les projets et les jeux Project Nightmare. N'hésitez pas à donner votre avis et à y réagir&nbsp;!",
	)
	execAndLog(
		`INSERT INTO categories (name, description) VALUES (?, ?)`,
		"Suggestions",
		"Des idées pour le forum&nbsp;? Pour la licence&nbsp;? Des améliorations à suggérer ? La parole est à vous, venez nous donner vos suggestions.",
	)
	execAndLog(
		`INSERT INTO categories (name, description) VALUES (?, ?)`,
		"Discussions",
		"Qui dit communauté dit conversation. Parlez de tout et de rien, de vos collègues relous, de vos expériences professionnelles, de vos dernières vacances. Tout ce qui vous plaira.",
	)
	execAndLog(
		`INSERT INTO categories (name, description) VALUES (?, ?)`,
		"Deadline Invaders",
		"Dans ce jeu inspiré de Space Invaders, un nouveau collègue désagréable rejoint votre équipe. Il s'attribue le mérite de vos succès et vous tient responsable des échecs. Achevez vos projets professionnels sans le laisser gâcher vos efforts, et faites en sorte que vous et vos autres collègues obteniez la reconnaissance que mérite votre travail.",
	)
	execAndLog(
		`INSERT INTO categories (name, description) VALUES (?, ?)`,
		"Am I The Relou&nbsp;?",
		"Vous sortez d'un conflit avec des collègues&nbsp;? Vous n'êtes pas sûr de savoir qui a raison ou tort dans cette affaire&nbsp;? Partagez votre expérience et la communauté décidera si vous avez un collègue relou... ou si vous ÊTES le collègue relou.",
	)
}