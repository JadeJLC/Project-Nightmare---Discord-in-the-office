package domain

import "time"

type Message struct {
	Id     int
	Author string
	Text   string
	Parent *Message
	Time   time.Time
}