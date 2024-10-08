package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/segmentio/kafka-go"
)

func convertToJson(content []byte) map[string]any {
	var data map[string]any
	err := json.Unmarshal(content, &data)
	if err != nil {
		topicData := make(map[string]any)
		topicData["value"] = strings.Replace(string(content), "\"", "", -1)

		return topicData
	} else {
		return data
	}
}

func ReadKafkaTopic(topic string, broker string, c chan Message) {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{broker},
		Topic:   topic,
	})
	defer r.Close()
	r.SetOffset(kafka.LastOffset)
	log.Printf("Listening to topic: %v\n", topic)

	for {
		m, err := r.ReadMessage(context.Background())
		if err != nil {
			break
		}

		c <- Message{Topic: topic, TopicData: TopicData{Content: convertToJson(m.Value), Time: m.Time}}
	}

	log.Printf("Finished reading topic %v\n", topic)

	if err := r.Close(); err != nil {
		log.Fatal("failed to close reader:", err)
	}
}

func main() {
	port := os.Getenv("PORT")
	kafka_broker := os.Getenv("KAFKA_BROKER")
	username := os.Getenv("USERNAME")
	password := os.Getenv("PASSWORD")

	capacities := make(map[string]int)
	capacities["temperature"] = 100
	capacities["host_discovered"] = 1
	capacities["webcam"] = 1
	capacities["webcam2"] = 1
	capacities["webcam_presence"] = 1
	capacities["webcam2_presence"] = 1

	image_topics := []string{"webcam", "webcam2"}

	data := CreateDatabase(capacities)
	c := make(chan Message, 10)

	for topic, _ := range capacities {
		go ReadKafkaTopic(topic, kafka_broker, c)
	}

	go func() {
		for message := range c {
			data.Set(message.Topic, message.TopicData)
		}
		log.Fatalf("Messages channel closed")
	}()

	r := gin.Default()
	authorized := r.Group("", gin.BasicAuth(gin.Accounts{
		username: password,
	}))
	authorized.GET("/topic/:topic", func(c *gin.Context) {
		topic := c.Param("topic")

		values, err := data.Get(topic)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"topic": topic,
			"data":  values,
		})
	})
	authorized.GET("/image/:topic", func(c *gin.Context) {
		topic := c.Param("topic")

		if slices.Contains(image_topics, topic) {
			values, err := data.Get(topic)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
				return
			}
			if len(values) == 0 {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Not found",
				})
				return
			}

			data, err := base64.StdEncoding.DecodeString(values[len(values)-1].Content["value"].(string))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
			c.Data(http.StatusOK, "image/jpeg", data)
			return
		}
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Not found",
		})
	})
	r.Run(fmt.Sprintf(":%v", port))
}
