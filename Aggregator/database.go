package main

import (
	"fmt"
	"sync"
)

type Database struct {
	mutex      sync.Mutex
	data       map[string][]TopicData
	capacities map[string]int
}

type DatabaseItem struct {
	Topic     string
	TopicData []TopicData
}

func CreateDatabase(capacities map[string]int) *Database {
	data := make(map[string][]TopicData, len(capacities))
	for topic, _ := range capacities {
		data[topic] = make([]TopicData, 0)
	}

	return &Database{
		mutex:      sync.Mutex{},
		data:       data,
		capacities: capacities,
	}
}

func (db *Database) Set(topic string, value TopicData) (bool, error) {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	topicValues, ok := db.data[topic]
	if !ok {
		return false, fmt.Errorf("Topic %v not known", topic)
	}

	topicValues = append(topicValues, value)
	if len(topicValues) > db.capacities[topic] {
		topicValues = topicValues[1:]
	}
	db.data[topic] = topicValues

	return true, nil
}

func (db *Database) Get(topic string) ([]TopicData, error) {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	topicValues, ok := db.data[topic]
	if !ok {
		return nil, fmt.Errorf("Topic %v not known", topic)
	}

	return topicValues, nil
}

func (db *Database) GetItems() []DatabaseItem {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	items := make([]DatabaseItem, 0)
	for topic, values := range db.data {
		items = append(items, DatabaseItem{Topic: topic, TopicData: values})
	}

	return items
}
