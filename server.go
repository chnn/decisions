package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
)

type vote struct {
	Value int `json:"value"`
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

	c = client{
		conn: conn,
		send: make(chan vote),
	}

	go receiveMessages(c)
}

func receiveMessages(c client) {
	defer func() {
		c.conn.Close()
		fmt.Println("Closed connection")
	}()

	for vote := range c.send {
		fmt.Println("Vote received on client channel")

		c.conn.WriteJSON(vote)
	}
}

func voteHandler(w http.ResponseWriter, r *http.Request) {
	// body := r.FormValue("Body")

	fmt.Println(r)
	// fmt.Println(body)

	c.send <- vote{Value: 1}

	w.WriteHeader(http.StatusOK)
}

func main() {
	http.HandleFunc("/ws", registerConnection)
	http.HandleFunc("/vote", voteHandler)
	http.Handle("/", http.FileServer(http.Dir("dist")))

	http.ListenAndServe(":4201", nil)
}
