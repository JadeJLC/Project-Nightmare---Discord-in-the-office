package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
)

// ExtractSql lit le fichier schema.sql et construit la map des tables et colonnes.
func ExtractSql(filePath string) map[string][]string {
	data, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatal(err)
	}

	sqlContent := string(data)
	schema := make(map[string][]string)

	parts := strings.Split(sqlContent, "CREATE TABLE")
	for _, part := range parts[1:] {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		openParen := strings.Index(part, "(")
		if openParen == -1 {
			continue
		}

		// Gère "IF NOT EXISTS `tablename`" ou directement "`tablename`"
		tableName := strings.TrimSpace(part[:openParen])
		tableName = strings.TrimPrefix(tableName, "IF NOT EXISTS")
		tableName = strings.TrimSpace(tableName)
		tableName = strings.Trim(tableName, "`\"")
		tableName = strings.TrimSpace(tableName)

		if tableName == "" {
			continue
		}

		// Trouver la vraie parenthèse fermante de la table en traçant la profondeur.
		// strings.LastIndex(")") est incorrect car les commentaires du schema
		// peuvent contenir des parenthèses ex: "-- mutedtopics (references : users)"
		closeParen := -1
		depth := 0
		for i := openParen; i < len(part); i++ {
			switch part[i] {
			case '(':
				depth++
			case ')':
				depth--
				if depth == 0 {
					closeParen = i
				}
			}
			if closeParen != -1 {
				break
			}
		}
		if closeParen == -1 {
			continue
		}

		columns := extractColumnList(part[openParen+1 : closeParen])
		schema[tableName] = columns
	}

	return schema
}

// ExtractColumns extrait les colonnes et contraintes d'un CREATE TABLE.
func ExtractColumns(createSQL string) []string {
	start := strings.Index(createSQL, "(")
	if start == -1 {
		return nil
	}

	// Trouver la parenthèse fermante par profondeur, pas par LastIndex
	end := -1
	depth := 0
	for i := start; i < len(createSQL); i++ {
		switch createSQL[i] {
		case '(':
			depth++
		case ')':
			depth--
			if depth == 0 {
				end = i
			}
		}
		if end != -1 {
			break
		}
	}
	if end == -1 {
		return nil
	}
	return extractColumnList(createSQL[start+1 : end])
}

// extractColumnList parse une liste de colonnes en gérant les parenthèses imbriquées.
func extractColumnList(columnsPart string) []string {
	var columns []string
	var current strings.Builder
	parentheses := 0

	for _, r := range columnsPart {
		switch r {
		case '(':
			parentheses++
			current.WriteRune(r)
		case ')':
			parentheses--
			current.WriteRune(r)
		case ',':
			if parentheses == 0 {
				col := strings.TrimSpace(current.String())
				if col != "" {
					columns = append(columns, NormalizeColumn(col))
				}
				current.Reset()
			} else {
				current.WriteRune(r)
			}
		default:
			current.WriteRune(r)
		}
	}

	if current.Len() > 0 {
		col := strings.TrimSpace(current.String())
		if col != "" {
			columns = append(columns, NormalizeColumn(col))
		}
	}

	return columns
}

// NormalizeColumn normalise une définition de colonne ou contrainte.
func NormalizeColumn(col string) string {
	col = strings.TrimSpace(col)
	col = strings.ToLower(col)
	col = strings.ReplaceAll(col, "\"", "")
	col = strings.ReplaceAll(col, "`", "")
	return col
}

// CompareColumns vérifie que deux listes de colonnes sont identiques.
func CompareColumns(expected, actual []string) bool {
	expectedMap := make(map[string]bool)
	for _, c := range expected {
		expectedMap[NormalizeColumn(c)] = true
	}
	for _, c := range actual {
		nc := NormalizeColumn(c)
		if !expectedMap[nc] {
			return false
		}
		delete(expectedMap, nc)
	}
	return len(expectedMap) == 0
}

// GetTableSQL récupère le SQL de création d'une table depuis sqlite_master.
func GetTableSQL(db *sql.DB, tableName string) (string, error) {
	var sqlStmt string
	row := db.QueryRow("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", tableName)
	if err := row.Scan(&sqlStmt); err != nil {
		return "", err
	}
	return sqlStmt, nil
}

// CompareDB compare le schéma attendu avec celui de la DB existante.
func CompareDB(dbPath string, expectedSchema map[string][]string) error {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("erreur ouverture DB pour comparaison: %w", err)
	}
	defer db.Close()

	var compareErr error

	for table, expectedCols := range expectedSchema {
		createSQL, err := GetTableSQL(db, table)
		if err != nil {
			fmt.Printf("Erreur : table '%s' manquante !\n", table)
			compareErr = fmt.Errorf("table '%s' manquante", table)
			continue
		}
		actualCols := ExtractColumns(createSQL)
		if !CompareColumns(expectedCols, actualCols) {
			fmt.Printf(
				"La table '%s' diffère du schéma attendu\nColonnes attendues : %v\nColonnes réelles   : %v\n",
				table, expectedCols, actualCols,
			)
			compareErr = fmt.Errorf("schéma différent pour la table '%s'", table)
		}
	}

	return compareErr
}