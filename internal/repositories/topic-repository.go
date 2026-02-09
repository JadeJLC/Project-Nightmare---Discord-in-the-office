package repositories

import (
	"database/sql"
	"log"
	"real-time-forum/internal/domain"
	"time"
)

type TopicRepo struct {
	db *sql.DB
}

func NewTopicRepo(db *sql.DB) *TopicRepo{
	return &TopicRepo{db: db}
}

/*
* Ouvre un nouveau sujet et l'ajoute dans la base de données
*/
func (r *TopicRepo) Create(category int, title string, authorId int) error {
	currentTime := time.Now()
	formattedTime := currentTime.Format("02/01/2006 à 15:04:05")
	_, err := r.db.Exec(`
        INSERT INTO topics (category, title, created_on, author)
        VALUES (?, ?, ?, ?)
    `, category, title, formattedTime, authorId)
    return err
}

/*
* Supprime un sujet de la base de données
*/
func (r *TopicRepo) Delete(topicID int) error {
    _, err := r.db.Exec(`
        DELETE FROM topics WHERE topic_id = ?
    `, topicID)
    return err
}

/*
* Récupère les informations d'un sujet à partir de son ID
*/
func (r *TopicRepo) GetTopicById(topicID int) (*domain.Topic, error) {
	row := r.db.QueryRow(`
        SELECT category, title, created_on, author
        FROM topics WHERE topic_id = ?`, topicID)

    topic := &domain.Topic{}
    err := row.Scan(&topic.CatID, &topic.Title, &topic.Time, &topic.Author)
    if err != nil {
        return nil, err
    }
    return topic, nil
}

/*
* Récupère les informations d'un sujet à partir de son titre
*/
func (r *TopicRepo) GetTopicByTitle(title string) (*domain.Topic, error) {
	row := r.db.QueryRow(`
        SELECT topic_id, category, created_on, author
        FROM topics WHERE title = ?`, title)

    topic := &domain.Topic{}
    err := row.Scan(&topic.ID, &topic.CatID, &topic.Time, &topic.Author)
    if err != nil {
        return nil, err
    }
    return topic, nil
}

/*
* Récupère tous les sujets ouverts par un utilisateur
*/
func (r *TopicRepo) GetTopicsByAuthor(authorID int) ([]*domain.Topic, error) {
	rows, err := r.db.Query(`SELECT 
    t.topic_id, 
    t.title, 
    t.created_on,
    m.content
	FROM topics t
	JOIN messages m ON m.topic_id = t.topic_id
	WHERE t.author = ?
  	AND m.post_id = (
      SELECT MIN(m2.post_id) 
      FROM messages m2 
      WHERE m2.topic_id = t.topic_id
  	)
	ORDER BY t.created_on DESC;`, authorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

    var topics = []*domain.Topic{}
	for rows.Next() {
	topic := &domain.Topic{}
		if err := rows.Scan(&topic.ID, &topic.Title, &topic.Time, &topic.FirstPost); err != nil {
			return nil, err
		}
		topics = append(topics, topic)
	}
   
    return topics, nil
}

/*
* Récupère tous les sujets d'une catégorie
*/
func (r *TopicRepo) GetTopicsByCategory(catID int) (*domain.TopicList, error) {
	rows, err := r.db.Query(`SELECT 
	t.topic_id, 
	t.title, 
	t.created_on,
	u.username
    FROM topics t
	JOIN users u ON t.author = u.user_id
    WHERE category = ?`, catID)
	if err != nil {
		log.Print("Erreur dans la récupération des sujets de la catégorie : ", err)
		return nil, err
	}
	defer rows.Close()

	var topiclist = domain.TopicList{}

    var topics = []*domain.Topic{}
	for rows.Next() {
	topic := &domain.Topic{}
		if err := rows.Scan(&topic.ID, &topic.Title, &topic.Time, &topic.Author); err != nil {
			return nil, err
		}
		topics = append(topics, topic)
	}

	topiclist.Topics = topics

    return &topiclist, nil
}

/*
* Récupère les 10 sujets les plus récents pour l'affichage du feed
*/
func (r *TopicRepo) GetTopicsByMostRecent(offset int) ([]*domain.LastPost, error) {
	rows, err := r.db.Query(`SELECT post_id, topic_id, content, created_on, username, title, category
	FROM (
    	SELECT
	        m.post_id,
    	    m.topic_id,
        	m.content,
        	m.created_on,
        	u.username,
        	t.title,
			t.category,
        	ROW_NUMBER() OVER(PARTITION BY m.topic_id ORDER BY m.created_on DESC) as rn
    	FROM messages m
    	JOIN topics t ON m.topic_id = t.topic_id 
    	JOIN users u ON m.author = u.user_id
		) t	
	WHERE rn = 1
	ORDER BY created_on DESC
	LIMIT 10 OFFSET ?`, offset)


	if err != nil {
		return nil, err
	}
	defer rows.Close()

    var lastPosts = []*domain.LastPost{}

	for rows.Next() {
		lastPost := &domain.LastPost{}
		err := rows.Scan(&lastPost.ID, &lastPost.TopicID, &lastPost.Content, &lastPost.Time, &lastPost.Author, &lastPost.TopicTitle, &lastPost.CatID); 

		if err != nil {
			return nil, err
		}

		lastPosts = append(lastPosts, lastPost)
	}

	if len(lastPosts) == 0 {
		lastPosts = append(lastPosts, &domain.LastPost{TopicTitle: "Aucun message"})
	}
	
   
    return lastPosts, nil
}