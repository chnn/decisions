package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
)

type vote struct {
	Value int `json:"value"`
}

var connections = make([]*websocket.Conn, 10)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func registerConnection(w http.ResponseWriter, r *http.Request) {
	connection, _ := upgrader.Upgrade(w, r, nil)
	connections = append(connections, connection)
}

func voteHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Received response\n")
	// TODO: Actually read text message :)

	m := vote{Value: 0}

	for _, connection := range connections {
		connection.WriteJSON(m)
	}

	w.WriteHeader(http.StatusOK)
}

func main() {
	http.HandleFunc("/ws", registerConnection)
	http.HandleFunc("/vote", voteHandler)
	http.Handle("/", http.FileServer(http.Dir("dist")))

	http.ListenAndServe(":4201", nil)
}
