package main

import (
	"context"

	kafka "github.com/segmentio/kafka-go"
)

const TOPIC string = "host_discovered"

var ctx = context.Background()

func GetKafkaProducer(broker string) *kafka.Writer {
	return &kafka.Writer{
		Addr:  kafka.TCP(broker),
		Topic: TOPIC,
	}
}

func SendEvent(producer *kafka.Writer, messageBytes []byte) error {
	message := kafka.Message{
		Value: messageBytes,
	}

	err := producer.WriteMessages(ctx, message)
	if err != nil {
		return err
	}

	return nil
}
