package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
)

type vote struct {
	Value string `json:"value"`
}

type client struct {
	conn *websocket.Conn
	send chan vote
}

var c client

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func registerConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		fmt.Println(err)
	}

	// TODO: More than one client
	c = client{
		conn: conn,
		send: make(chan vote),
	}

	go broadcastVotes(c)
}

func broadcastVotes(c client) {
	defer c.conn.Close()

	for vote := range c.send {
		c.conn.WriteJSON(vote)
	}
}

func voteHandler(w http.ResponseWriter, r *http.Request) {
	body := r.FormValue("Body")

	fmt.Printf("Received vote: %v\n", body)

	if c.send != nil {
		c.send <- vote{Value: body}
	}

	fmt.Fprintf(w, "")
}

func main() {
	http.HandleFunc("/ws", registerConnection)
	http.HandleFunc("/vote", voteHandler)
	http.Handle("/", http.FileServer(http.Dir("dist")))

	http.ListenAndServe(":80", nil)
}
