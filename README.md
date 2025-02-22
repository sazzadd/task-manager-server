# Task Manager Server

This is the backend server for a task management application, built with Node.js, Express.js, MongoDB, and Socket.IO. It provides API endpoints for managing tasks and real-time updates through WebSockets.

**Live URL:** [https://task-manager-server-production-7101.up.railway.app/](https://task-manager-server-production-7101.up.railway.app/)

## Features

* **Task Management:**
    * Create, read, update, and delete tasks (CRUD operations).
    * Tasks are stored in a MongoDB database.
    * Tasks are filtered by user email.
* **Real-time Updates:**
    * Uses Socket.IO for real-time updates when tasks are added, updated, or deleted.
    * Clients are notified instantly of changes.
* **Database:**
    * Uses MongoDB as the database.
* **API Endpoints:**
    * Provides RESTful API endpoints for task management.
* **Cross-Origin Resource Sharing (CORS):**
    * Enabled CORS for cross-origin requests.

## Technologies Used

* **Node.js:** JavaScript runtime environment.
* **Express.js:** Web application framework for Node.js.
* **MongoDB:** NoSQL database.
* **Mongoose (Optional, but could be used instead of native MongoDB driver):** MongoDB object modeling tool.
* **Socket.IO:** Real-time communication library.
* **CORS:** Cross-Origin Resource Sharing middleware.
* **dotenv:** Loads environment variables from a `.env` file.



 **API Endpoints:**

    * `GET /tasks?email={userEmail}`: Get all tasks for a specific user.
    * `POST /tasks`: Create a new task.
    * `PUT /tasks/:id`: Update an existing task.
    * `DELETE /tasks/:id`: Delete an existing task.

