package main

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type ToDoType string

const (
	BUY  ToDoType = "BUY"
	DO   ToDoType = "DO"
	DONE ToDoType = "DONE"
	USE  ToDoType = "USE"
)

type ToDo struct {
	ID        int      `json:"id"`
	Title     string   `json:"title"`
	Text      string   `json:"text"`
	Type      ToDoType `json:"type"`
	Completed bool     `json:"completed"`
}

var todos []ToDo

// Seed some initial data
func init() {
	todos = append(todos, ToDo{ID: 1, Title: "Buy", Text: "Buy Groceries", Type: BUY, Completed: false})
	todos = append(todos, ToDo{ID: 2, Title: "Do", Text: "Finish Report", Type: DO, Completed: true})
	todos = append(todos, ToDo{ID: 3, Title: "Birthday present", Text: "Present to Theo", Type: DO, Completed: true})

	// Parse the template
	//template.Must(template.ParseFiles("templates/index.html"))
}

func main() {
	router := gin.Default()

	router.LoadHTMLGlob("templates/*.*")

	// Serve static files from "static" directory
	router.Static("/static", "public") // Add this line

	// Group API endpoints under "/json"
	json := router.Group("/json/v1")
	{
		json.GET("/todos", getTodos)
		json.GET("/todos/:id", getTodoByID)
		json.POST("/todos", createTodo)
		json.PUT("/todos/:id", updateTodo)
		json.DELETE("/todos/:id", deleteTodo)
	}

	html := router.Group("/html/v1")
	{
		html.GET("/todos", getTodos)
		html.GET("/todos/:id", getTodoByID)
		html.POST("/todos", createTodo)
		html.PUT("/todos/:id", updateTodo)
		html.DELETE("/todos/:id", deleteTodo)
	}

	// Route for main page
	router.GET("/", func(c *gin.Context) {
		//tmpl := template.Must(template.ParseFiles("templates/index.tmpl"))
		//tmpl.Execute(c.Writer, gin.H{"Todos": todos})
		c.HTML(http.StatusOK, "index.html", gin.H{"Todos": todos})
	})

	router.Run(":8080")
}

func getTodos(c *gin.Context) {
	path := c.Request.URL.Path
	fmt.Println("The URL: ", c.Request.Host+c.Request.URL.Path)
	if strings.HasPrefix(path, "/html/") {
		c.HTML(http.StatusOK, "todos.html", gin.H{"Todos": todos})
	} else {
		c.JSON(http.StatusOK, todos)
	}
}

func getTodoByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	for _, todo := range todos {
		if todo.ID == id {
			if strings.HasPrefix(c.Request.URL.Path, "/html/") {
				c.HTML(http.StatusOK, "todo.html", gin.H{"Todo": todo})
			} else {
				c.JSON(http.StatusOK, todo)
			}
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
}

func createTodo(c *gin.Context) {
	var newTodo = ToDo{ID: 3, Title: "New", Text: "...", Type: DO, Completed: false}

	/*
		if err := c.BindJSON(&newTodo); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}*/

	newTodo.ID = len(todos) + 1

	todos = append(todos, newTodo)

	c.JSON(http.StatusCreated, newTodo)
}

func updateTodo(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updatedTodo ToDo
	if err := c.BindJSON(&updatedTodo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body !!!!"})
		return
	}

	found := false
	for i, todo := range todos {
		if todo.ID == id {
			todos[i] = updatedTodo
			found = true
			break
		}
	}

	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	c.JSON(http.StatusOK, updatedTodo)
}

func deleteTodo(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	newTodos := []ToDo{}
	for _, todo := range todos {
		if todo.ID != id {
			newTodos = append(newTodos, todo)
		}
	}

	todos = newTodos
	c.JSON(http.StatusNoContent, nil) // No content response for DELETE
}
