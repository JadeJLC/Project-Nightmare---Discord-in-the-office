package domain

type Log struct {
	ID int `json:"log_id"`
	Type string `json:"log_type"`
	Message string `json:"log_message"`
	Data string `json:"log_data"`
}


type AdminRepo interface {
	SaveLogToDatabase(log string)
}