require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.krhx2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const taskCollection = client.db("task-manager").collection("tasks");

    // WebSocket connection
    io.on("connection", (socket) => {
      console.log("New client connected");
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    // GET all tasks
    app.get("/tasks", async (req, res) => {
      try {
        const userEmail = req.query.email; 
        if (!userEmail) {
          return res.status(400).json({ message: "User email is required" });
        }
    
        const result = await taskCollection.find({ userEmail }).toArray(); // শুধু নির্দিষ্ট ইউজারের টাস্ক আনছি
        res.json(result);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks" });
      }
    });

    // POST new task
    app.post("/tasks", async (req, res) => {
      try {
        const task = req.body;
        const result = await taskCollection.insertOne(task);
        const insertedTask = await taskCollection.findOne({
          _id: result.insertedId,
        });
        io.emit("taskAdded", insertedTask);
        res.status(201).json(insertedTask);
      } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ message: "Error adding task" });
      }
    });

    // PUT update task
    app.put("/tasks/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedTask = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: updatedTask,
        };
        const result = await taskCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        const updatedDocument = await taskCollection.findOne(filter);
        io.emit("taskUpdated", updatedDocument);
        res.json(updatedDocument);
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Error updating task" });
      }
    });

    // DELETE task
    app.delete("/tasks/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await taskCollection.deleteOne(query);
        if (result.deletedCount === 1) {
          io.emit("taskDeleted", id);
          res.json({ message: "Task deleted successfully" });
        } else {
          res.status(404).json({ message: "Task not found" });
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Error deleting task" });
      }
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Management Server is running...");
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
