package auth

import (
	"sync"
	"time"
)

type Visitor struct {
	lastSeen time.Time
}

var (
	visitors = make(map[string]*Visitor)
	mu       sync.Mutex
)

func IsRateLimited(ip string) bool {
	mu.Lock()
	defer mu.Unlock()

	v, exists := visitors[ip]
	if !exists {
		visitors[ip] = &Visitor{lastSeen: time.Now()}
		return false
	}

	// Define your limit: e.g., 2 seconds between registration/edit attempts
	if time.Since(v.lastSeen) < 2*time.Second {
		return true
	}

	v.lastSeen = time.Now()
	return false
}