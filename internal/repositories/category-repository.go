package repositories

import (
	"database/sql"
	"real-time-forum/internal/domain"
)

type categRepo struct {
	db *sql.DB
}

func NewCategRepo(db *sql.DB) domain.CategoryRepo {
	return &categRepo {db:db}
}

func (r *categRepo) GetCategoryFromID(catID int) (*domain.Category, error) {
row := r.db.QueryRow(`SELECT name, description
    FROM categories
    WHERE cat_id = ?`, catID)

    category := &domain.Category{}
    err := row.Scan(&category.Name, &category.Description)
    if err != nil {
        return nil, err
    }
    return category, nil
}

func (r *categRepo) GetAllCategories() ([]*domain.Category, error) {
	rows, err := r.db.Query(`SELECT cat_id, name, description 
    FROM categories`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

    var categories = []*domain.Category{}
	category := &domain.Category{}
	for rows.Next() {
		if err := rows.Scan(&category.ID, &category.Name, &category.Description); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
   
    return categories, nil
}