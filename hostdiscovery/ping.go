package main

import (
	"log"
	"net"
	"os"
	"time"

	"golang.org/x/net/icmp"
	"golang.org/x/net/ipv4"
)

func Ping(hostname string) (bool, error) {
	ip, err := net.ResolveIPAddr("ip4", hostname)
	if err != nil {
		log.Printf("Failed to resolve the hostname %s: %s", hostname, err)
		return false, err
	}
	udpAddr := net.UDPAddr{IP: ip.IP}

	conn, err := icmp.ListenPacket("udp4", "0.0.0.0")
	if err != nil {
		log.Printf("Error listening: %s", err)
		return false, err
	}
	defer conn.Close()

	message := icmp.Message{
		Type: ipv4.ICMPTypeEcho,
		Code: 0,
		Body: &icmp.Echo{
			ID:   os.Getpid() & 0xffff,
			Seq:  1,
			Data: []byte(""),
		},
	}
	messageBytes, err := message.Marshal(nil)
	if err != nil {
		log.Printf("Error marshalling: %s", err)
		return false, err
	}

	_, err = conn.WriteTo(messageBytes, &udpAddr)
	if err != nil {
		log.Printf("Error writing message to target %s: %s", udpAddr.String(), err)
		return false, err
	}

	err = conn.SetReadDeadline(time.Now().Add(time.Millisecond * 500))
	if err != nil {
		log.Printf("Error setting read deadline: %s", err)
		return false, err
	}

	response := make([]byte, 1500)
	n, _, err := conn.ReadFrom(response)
	if err != nil {
		log.Printf("Error reading response: %s", err)
		return false, err
	}

	parsedResponse, err := icmp.ParseMessage(ipv4.ICMPTypeEchoReply.Protocol(), response[:n])
	if err != nil {
		log.Printf("Error parsing response: %s", err)
		return false, err
	}

	switch parsedResponse.Type {
	case ipv4.ICMPTypeEchoReply:
		log.Printf("Received response from target %s", hostname)
		return true, nil
	default:
		log.Printf("Target host did not respond: %+v", parsedResponse)
		return false, nil
	}
}
