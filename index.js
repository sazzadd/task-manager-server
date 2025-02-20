require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Update this with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.krhx2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    await client.connect()
    const taskCollection = client.db("task-manager").collection("tasks")

    // WebSocket connection
    io.on("connection", (socket) => {
      console.log("A user connected")

      socket.on("disconnect", () => {
        console.log("User disconnected")
      })
    })

    // GET all tasks for a user
    app.get("/tasks/:userId", async (req, res) => {
      const userId = req.params.userId
      const cursor = taskCollection.find({ userId })
      const result = await cursor.toArray()
      res.send(result)
    })

    // POST a new task
    app.post("/tasks", async (req, res) => {
      const task = req.body
      const result = await taskCollection.insertOne(task)
      io.emit("taskAdded", { ...task, _id: result.insertedId })
      res.send(result)
    })

    // PUT update a task
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id
      const updatedTask = req.body
      const filter = { _id: new ObjectId(id) }
      const update = { $set: updatedTask }
      const result = await taskCollection.updateOne(filter, update)
      io.emit("taskUpdated", { id, ...updatedTask })
      res.send(result)
    })

    // DELETE a task
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id
      const result = await taskCollection.deleteOne({ _id: new ObjectId(id) })
      io.emit("taskDeleted", id)
      res.send(result)
    })

    // PUT update task order
    app.put("/tasks/reorder/:userId", async (req, res) => {
      const userId = req.params.userId
      const { tasks } = req.body

      const bulkOps = tasks.map((task, index) => ({
        updateOne: {
          filter: { _id: new ObjectId(task._id), userId },
          update: { $set: { order: index, category: task.category } },
        },
      }))

      const result = await taskCollection.bulkWrite(bulkOps)
      io.emit("tasksReordered", { userId, tasks })
      res.send(result)
    })

    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
  }
}

run().catch(console.dir)

app.get("/", (req, res) => {
  res.send("Task Management Server is running")
})

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

