
const API = "/api/tasks";

let currentFilter = "all";

// =========================
// LOAD TASKS
// =========================

async function loadTasks() {
    try {
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error("Unable to fetch tasks");
        }

        const tasks = await response.json();

        updateStats(tasks);
        displayTasks(tasks);

    } catch (error) {
        console.error(error);
        alert("Could not connect to the server.");
    }
}

// =========================
// UPDATE STATISTICS
// =========================

function updateStats(tasks) {

    document.getElementById("totalTasks").textContent =
        tasks.length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(task => task.completed).length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(task => !task.completed).length;
}

// =========================
// DISPLAY TASKS
// =========================

function displayTasks(tasks) {

    const taskList = document.getElementById("taskList");
    const emptyMessage = document.getElementById("emptyMessage");

    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {

        if (currentFilter === "completed") {
            return task.completed;
        }

        if (currentFilter === "pending") {
            return !task.completed;
        }

        return true;
    });

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    filteredTasks.forEach(task => {

        const li = document.createElement("li");
        li.className = "task-item";

        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "complete-btn";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            toggleTask(task.id, checkbox.checked);
        });

        // Task title
        const title = document.createElement("span");

        title.className = "task-title";
        title.textContent = task.title;

        if (task.completed) {
            title.classList.add("completed");
        }

        // Action buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Edit button
        const editBtn = document.createElement("button");

        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";

        editBtn.addEventListener("click", () => {
            editTask(task);
        });

        // Delete button
        const deleteBtn = document.createElement("button");

        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(editBtn, deleteBtn);

        li.append(checkbox, title, actions);

        taskList.appendChild(li);
    });
}

// =========================
// ADD TASK
// =========================

async function addTask() {

    const input = document.getElementById("taskInput");
    const title = input.value.trim();

    if (!title) {
        alert("Please enter a task!");
        return;
    }

    try {

        const response = await fetch(API, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ title })
        });

        if (!response.ok) {
            throw new Error("Unable to add task");
        }

        input.value = "";

        await loadTasks();

    } catch (error) {
        alert(error.message);
    }
}

// =========================
// COMPLETE TASK
// =========================

async function toggleTask(id, completed) {

    try {

        const response = await fetch(`${API}/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ completed })
        });

        if (!response.ok) {
            throw new Error("Unable to update task");
        }

        await loadTasks();

    } catch (error) {
        alert(error.message);
    }
}

// =========================
// EDIT TASK
// =========================

async function editTask(task) {

    const newTitle = prompt(
        "Edit your task:",
        task.title
    );

    if (newTitle === null || !newTitle.trim()) {
        return;
    }

    try {

        const response = await fetch(`${API}/${task.id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: newTitle.trim()
            })
        });

        if (!response.ok) {
            throw new Error("Unable to edit task");
        }

        await loadTasks();

    } catch (error) {
        alert(error.message);
    }
}

// =========================
// DELETE TASK
// =========================

async function deleteTask(id) {

    if (!confirm("Do you want to delete this task?")) {
        return;
    }

    try {

        const response = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete task");
        }

        await loadTasks();

    } catch (error) {
        alert(error.message);
    }
}

// =========================
// FILTER TASKS
// =========================

document.querySelectorAll(".filter").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelector(".filter.active")
            ?.classList.remove("active");

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        loadTasks();
    });
});

// =========================
// ADD BUTTON
// =========================

document.getElementById("addBtn")
    .addEventListener("click", addTask);

// Enter key
document.getElementById("taskInput")
    .addEventListener("keydown", event => {

        if (event.key === "Enter") {
            addTask();
        }
    });

// =========================
// DARK / LIGHT MODE
// =========================

const themeToggle = document.getElementById("themeToggle");

// Load saved theme
const savedTheme =
    localStorage.getItem("todo-theme") || "light";

// Apply theme
function applyTheme(theme) {

    document.body.classList.toggle(
        "dark-theme",
        theme === "dark"
    );

    themeToggle.textContent =
        theme === "dark"
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";

    localStorage.setItem("todo-theme", theme);
}

// Toggle theme button
themeToggle.addEventListener("click", () => {

    const isDark =
        document.body.classList.contains("dark-theme");

    applyTheme(isDark ? "light" : "dark");
});

// Initial theme
applyTheme(savedTheme);

// =========================
// INITIAL LOAD
// =========================

loadTasks();
