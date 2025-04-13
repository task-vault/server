# API Endpoints Documentation

This document outlines the API endpoints for the application. The endpoints are categorized into open and authenticated sections.

---

## Open Endpoints

These endpoints are publicly accessible and do **not** require authentication.

---

### User (Open)

#### `POST /users/register`

**Description:**
Registers a new user.
**Authentication Options:** Email & Password, Google.

#### `POST /users/login`

**Description:**  
Authenticates an existing user.  
**Authentication Options:** Email & Password, Google.

---

## Authenticated Endpoints

These endpoints require the user to be authenticated.

---

### User (Authenticated)

#### `POST /users/refresh`

**Description:**
Refreshes the authentication token.

#### `POST /users/logout`

**Description:**  
Logs out the authenticated user.

---

### Tasks

#### `GET /tasks`

**Description:**  
Fetches all tasks for the authenticated user.

#### `POST /tasks`

**Description:**  
Creates a new task.

#### `DELETE /tasks`

**Description:**  
Deletes multiple tasks.  
**Note:** Task IDs must be provided in the request body.

#### `GET /tasks/:taskId`

**Description:**  
Fetches a specific task by ID.

#### `PUT /tasks/:taskId`

**Description:**  
Updates a specific task by ID.

#### `DELETE /tasks/:taskId`

**Description:**  
Deletes a specific task by ID.

#### `POST /tasks/:taskId/complete`

**Description:**  
Marks a task as completed.

#### `DELETE /tasks/:taskId/complete`

**Description:**  
Marks a task as incomplete.

---

### Subtasks

#### `GET /tasks/:taskId/subtasks`

**Description:**  
Returns all subtasks for a given task.

#### `POST /tasks/:taskId/subtasks`

**Description:**  
Creates a new subtask for the specified task.

#### `DELETE /tasks/:taskId/subtasks`

**Description:**  
Deletes multiple subtasks.  
**Note:** Subtask IDs must be provided in the request body.

#### `PUT /tasks/:taskId/subtasks/:subtaskId`

**Description:**  
Updates a specific subtask.

#### `DELETE /tasks/:taskId/subtasks/:subtaskId`

**Description:**  
Deletes a specific subtask.

#### `POST /tasks/:taskId/subtasks/:subtaskId/complete`

**Description:**  
Marks a subtask as completed.

#### `DELETE /tasks/:taskId/subtasks/:subtaskId/complete`

**Description:**  
Marks a subtask as incomplete.

---

### Categories

#### `GET /categories`

**Description:**  
Returns all categories belonging to the user.

#### `POST /categories`

**Description:**  
Creates a new category.

#### `GET /categories/:categoryId`

**Description:**  
Fetches a specific category by ID.

#### `PUT /categories/:categoryId`

**Description:**  
Updates a specific category.

#### `DELETE /categories/:categoryId`

**Description:**  
Deletes a specific category.

#### `GET /categories/:categoryId/tasks`

**Description:**  
Returns all tasks associated with a specific category.
