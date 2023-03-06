package main

import (
	"encoding/json"
	"log"
	"os"
	"time"
)

type Event struct {
	Value bool `json:"value"`
}

func getEvent(hasDiscoveredTargetHost bool) ([]byte, error) {
	event := Event{Value: hasDiscoveredTargetHost}

	eventBytes, err := json.Marshal(event)
	if err != nil {
		log.Printf("Error marshalling event: %v", err)
		return nil, err
	}

	return eventBytes, nil
}

func main() {
	targetHost := os.Getenv("TARGET_HOST")
	log.Printf("Target Host: %s", targetHost)
	kafkaBroker := os.Getenv("KAFKA_BROKER")
	log.Printf("Kafka Broker: %s", kafkaBroker)
	producer := GetKafkaProducer(kafkaBroker)

	for {
		hasDiscoveredTargetHost, err := Ping(targetHost)
		if err != nil {
			log.Printf("Failed to ping target: %v", err)
		}
		log.Printf("Is Target present: %v", hasDiscoveredTargetHost)

		eventBytes, err := getEvent(hasDiscoveredTargetHost)
		if err != nil {
			log.Fatalf("Failed to encode event: %v", err)
		}

		err = SendEvent(producer, eventBytes)
		if err != nil {
			log.Fatalf("Failed to send event: %v", err)
		}
		time.Sleep(time.Second * 10)
	}
}
