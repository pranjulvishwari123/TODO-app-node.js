
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const {
  DynamoDBClient
} = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const app = express();

const PORT = process.env.PORT || 3000;
const REGION = process.env.AWS_REGION || "ap-south-1";
const TABLE_NAME = process.env.TASK_TABLE || "tasks";

const client = new DynamoDBClient({
  region: REGION
});

const db = DynamoDBDocumentClient.from(client);

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


// Health check for ALB

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy"
  });
});


// Get all tasks

app.get("/api/tasks", async (req, res) => {
  try {
    let tasks = [];
    let lastKey;

    do {
      const response = await db.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          ExclusiveStartKey: lastKey
        })
      );

      tasks.push(...(response.Items || []));
      lastKey = response.LastEvaluatedKey;

    } while (lastKey);

    res.json(tasks);

  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      message: "Unable to fetch tasks"
    });
  }
});


// Add task

app.post("/api/tasks", async (req, res) => {
  try {
    const title = req.body.title;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: newTask
      })
    );

    res.status(201).json(newTask);

  } catch (error) {
    console.error("Add task error:", error);
    res.status(500).json({
      message: "Unable to add task"
    });
  }
});


// Update task

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const updates = {};

    if (typeof req.body.title === "string" &&
        req.body.title.trim()) {
      updates.title = req.body.title.trim();
    }

    if (typeof req.body.completed === "boolean") {
      updates.completed = req.body.completed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Nothing to update"
      });
    }

    const names = {};
    const values = {};
    const expressions = [];

    Object.entries(updates).forEach(([key, value], index) => {
      const name = `#field${index}`;
      const val = `:value${index}`;

      names[name] = key;
      values[val] = value;

      expressions.push(`${name} = ${val}`);
    });

    await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id
        },
        UpdateExpression: "SET " + expressions.join(", "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ConditionExpression: "attribute_exists(id)"
      })
    );

    res.json({
      message: "Task updated successfully"
    });

  } catch (error) {
    console.error("Update task error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(500).json({
      message: "Unable to update task"
    });
  }
});


// Delete task

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await db.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id
        },
        ConditionExpression: "attribute_exists(id)"
      })
    );

    res.json({
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error("Delete task error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(500).json({
      message: "Unable to delete task"
    });
  }
});


// Start server

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
