package main

import (
	"encoding/json"
	"time"
)

type TopicData struct {
	Content map[string]any `json:"content"`
	Time    time.Time      `json:"time"`
}

type SerializedTopicData struct {
	Content   map[string]any `json:"content"`
	Timestamp int64          `json:"timestamp"`
}

func (td *TopicData) MarshalJSON() ([]byte, error) {
	return json.Marshal(&SerializedTopicData{
		Content:   td.Content,
		Timestamp: td.Time.Unix(),
	})
}

type Message struct {
	TopicData
	Topic string
}
