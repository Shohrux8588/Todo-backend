const express = require("express");
const mongoose = require("mongoose");
const Todo = require("./models/todo");
const app = express();


// ---------------------------- Connection MongoDB Atlas with mongoose ------------------------
// mongodb atlas connection url
const dbURI = "mongodb+srv://shakhrukh:test1234@cluster0.jhlct.mongodb.net/node?retryWrites=true&w=majority";

// connecting to mongodb atlas
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        console.log("connected to db");
        app.listen(3000, (req, res) => {
            console.log("Server is listening at port 3000...");
        })
    })
    .catch(err => {
        console.log(err);
    });


// setting view engine
app.set("view engine", "ejs");

// setting middleware
app.use(express.urlencoded({ extended: true }));


// ----------------------------------------- Routes------------------------------------------
// home page
app.get("/", (req, res) => {
    res.redirect("/todos");
})

// viewing first page
app.get("/todos", (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    Todo.find().sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit)
        .then(result => {
            res.render("index", { todos: result });
        }).catch(err => {
            console.log(err);
        })
})

// create page
app.get("/create-todo", (req, res) => {
    res.render("create");
})

// creating a new todo
app.post("/todos", (req, res) => {
    const todo = new Todo(req.body);
    todo.save()
        .then(result => {
            res.redirect("/todos");
        })
        .catch(err => {
            console.log(err);
        })
})

// viewing a single todo
app.get("/todos/:id", (req, res, next) => {
    Todo.findById(req.params.id)
        .then(result => {
            res.render("details", { todo: result });
            next();
        })
        .catch(err => {
            console.log(err);
        })
})

// updating a todo 
app.patch("/todos/:id", async (req, res) => {
    const id = req.params.id;
    const completed = await Todo.findById(id).then(result => result.completed);
    await Todo.findByIdAndUpdate(id, { completed: !completed });
    res.json({ redirect: "/todos" });
});

// deleting a todo
app.delete("/todos/:id", (req, res) => {
    const id = req.params.id;
    Todo.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: "/todos" });
        })
        .catch(err => {
            console.log(err);
        })
})
