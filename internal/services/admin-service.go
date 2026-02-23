package services

import (
	"real-time-forum/internal/repositories"
)

type AdminService struct {
    repo *repositories.AdminRepo
}

func NewAdminService(r *repositories.AdminRepo) *AdminService {
    return &AdminService{repo: r}
}

func (s *AdminService) SaveLogToDatabase(log string) (error) {
	return s.repo.SaveLogToDatabase(log)
}

func (s *AdminService) BanUser(userID string) (error) {
	return s.repo.BanUser(userID)
}

func (s *AdminService) UnbanUser(userID string) (error) {
	return s.repo.UnbanUser(userID)
}

func (s *AdminService) DeleteUser(userID string) (error) {
	return s.repo.DeleteUser(userID)
}

func (s *AdminService) PromoteUser(userID string, role int) (error) {
	return s.repo.PromoteUser(userID, role)
}
