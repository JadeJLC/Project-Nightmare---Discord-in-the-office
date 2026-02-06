package repositories

import (
	"database/sql"
	"real-time-forum/internal/domain"
)

type CategoryRepo struct {
	db *sql.DB
}

func NewCategRepo(db *sql.DB) *CategoryRepo {
	return &CategoryRepo {db:db}
}

/* 
* Récupère le nom et la description de la catégorie à partir de son ID
*/
func (r *CategoryRepo) GetCategoryFromID(catID int) (*domain.Category, error) {
row := r.db.QueryRow(`SELECT name, description
    FROM categories
    WHERE cat_id = ?`, catID)

    category := &domain.Category{}
    err := row.Scan(&category.Name, &category.Description)
    if err != nil {
        return nil, err
    }

	category.LastPost, err = r.GetCatLastPost(category.ID)
	if err != nil {
			return nil, err
	}
    return category, nil
}

/* 
* Récupère la liste complète de toutes les catégories du forum (id, nom et description)
*/
func (r *CategoryRepo) GetAllCategories() ([]*domain.Category, error) {
	rows, err := r.db.Query(`SELECT cat_id, name, description 
    FROM categories`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

    var categories = []*domain.Category{}
	for rows.Next() {
	category := &domain.Category{}
		if err := rows.Scan(&category.ID, &category.Name, &category.Description); err != nil {
			return nil, err
		}

		category.LastPost, err = r.GetCatLastPost(category.ID)
		if err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
   
    return categories, nil
}

/* 
* Récupère le dernier post envoyé dans une catégorie, et le titre du sujet associé
*/
func (r *CategoryRepo) GetCatLastPost(catID int) (domain.LastPost, error) {
	row := r.db.QueryRow(`
        SELECT
            m.post_id,
            m.topic_id,
            m.content,
            m.created_on,
            u.username,
            t.title
        FROM messages m
        JOIN topics t ON m.topic_id = t.topic_id 
		JOIN users u ON m.author = u.user_id
		WHERE t.category = ?
        ORDER BY m.created_on DESC
		LIMIT 1;
    `, catID)

	var lastPost = domain.LastPost{}

	 err := row.Scan(&lastPost.ID, &lastPost.TopicID, &lastPost.Content, &lastPost.Time, &lastPost.Author, &lastPost.TopicTitle)
 
	if err == sql.ErrNoRows {
        return domain.LastPost{TopicTitle: "Aucun message pour le moment"}, nil
    } else if err != nil {
		return domain.LastPost{}, err
	}
	return lastPost, nil
}