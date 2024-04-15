package main

import (
  "net/http"
  "fmt"
)

func ping(w http.ResponseWriter, r *http.Request) {
  w.Write([]byte("pong"))
}

func main() {
  http.Handle("/", http.FileServer(http.Dir("./public")))
  http.HandleFunc("/ping", ping)
  fmt.Printf("listening on port 8080\n");
  if err := http.ListenAndServe(":8080", nil); err != nil {
    panic(err)
  }
}
