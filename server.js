
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const filePath = path.join(__dirname, "data", "tasks.json");

// Read tasks
function getTasks() {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Save tasks
function saveTasks(tasks) {
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
}

// Get all tasks
app.get("/api/tasks", (req, res) => {
    res.json(getTasks());
});

// Add task
app.post("/api/tasks", (req, res) => {
    const title = req.body.title;

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const tasks = getTasks();

    const newTask = {
        id: Date.now(),
        title: title.trim(),
        completed: false
    };

    tasks.push(newTask);
    saveTasks(tasks);

    res.status(201).json(newTask);
});

// Update task
app.put("/api/tasks/:id", (req, res) => {
    const tasks = getTasks();

    const task = tasks.find(
        t => t.id === Number(req.params.id)
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    if (typeof req.body.completed === "boolean") {
        task.completed = req.body.completed;
    }

    if (typeof req.body.title === "string" && req.body.title.trim()) {
        task.title = req.body.title.trim();
    }

    saveTasks(tasks);
    res.json(task);
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
    const tasks = getTasks();

    const updatedTasks = tasks.filter(
        t => t.id !== Number(req.params.id)
    );

    if (tasks.length === updatedTasks.length) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    saveTasks(updatedTasks);

    res.json({
        message: "Task deleted successfully"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
