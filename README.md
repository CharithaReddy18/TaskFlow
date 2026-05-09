# Project Sphere — A Role-Based Project and Task Management Web App

Project Sphere is a comprehensive full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js), deployed on Railway. It allows users to create projects, invite teammates with specific roles, assign tasks, and track progress using a premium, dynamic interface.

## 🚀 Live Demo Links

- **Frontend URL:** [https://taskflow-production-540f.up.railway.app](https://taskflow-production-540f.up.railway.app)
- **Backend API URL:** [https://taskflow-production-3ff0.up.railway.app/api](https://taskflow-production-3ff0.up.railway.app/api)
- **Swagger UI:** [https://taskflow-production-3ff0.up.railway.app/api/docs/](https://taskflow-production-3ff0.up.railway.app/api/docs/)

**Test Credentials:**
- **Admin Account:** email: `admin@test.com` | password: `password123`
- **Member Account:** email: `member@test.com` | password: `password123`

## 🛠 Tech Stack

- **Frontend:** React (Vite), React Router, Context API, Vanilla CSS (Glassmorphism), Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) + bcrypt
- **Documentation:** Swagger (swagger-ui-express, swagger-jsdoc)
- **Testing:** Jest + Supertest
- **Hosting:** Railway (Backend + Frontend)

## ✨ Features Implemented

- [x] Authentication (Signup / Login with JWT)
- [x] Project and team management (Create projects, invite members)
- [x] Task creation, assignment, and status tracking
- [x] Dashboard (tasks, status counts, overdue items)
- [x] REST APIs backed by MongoDB
- [x] Field validations and entity relationships
- [x] Role-Based Access Control (Admin and Member per-project)

## 🗄 ER Diagram

```mermaid
erDiagram
    USER {
        ObjectId id
        String name
        String email
        String password
    }
    PROJECT {
        ObjectId id
        String name
        String description
        ObjectId ownerId
    }
    MEMBERSHIP {
        ObjectId id
        ObjectId user
        ObjectId project
        String role
    }
    TASK {
        ObjectId id
        String title
        String description
        String category
        String status
        String priority
        Date dueDate
        ObjectId projectId
        ObjectId assigneeId
    }

    USER ||--o{ MEMBERSHIP : "has"
    PROJECT ||--o{ MEMBERSHIP : "includes"
    PROJECT ||--o{ TASK : "contains"
    USER ||--o{ TASK : "assigned to"
    USER ||--o{ PROJECT : "owns"
```

## 🔐 RBAC Explanation

This application uses **Per-Project Role-Based Access Control**. A user can be an Admin in one project and a Member in another. 

| Action | Admin | Member |
|---|---|---|
| Create / delete project | Yes | No |
| Add / remove members | Yes | No |
| Create task | Yes | No |
| Assign / reassign task | Yes | No |
| Update own task status | Yes | Yes |
| Update others' tasks | Yes | No |
| Delete task | Yes | No |
| View dashboard | Yes | Yes |

## 📡 API Reference

- **POST** `/api/auth/signup` - Register a new user
- **POST** `/api/auth/login` - Authenticate and get JWT
- **GET** `/api/projects` - List all projects user is a member of
- **POST** `/api/projects` - Create a new project
- **POST** `/api/projects/:id/members` - Add a member to a project
- **DELETE** `/api/projects/:id/members/:userId` - Remove a member
- **GET** `/api/tasks` - List tasks for the user's projects
- **POST** `/api/tasks` - Create a task
- **PUT** `/api/tasks/:id` - Update a task
- **GET** `/api/dashboard/summary` - Aggregated stats for the logged-in user

*For full interactive reference, visit the [Swagger UI](/api/docs/).*

## 💻 Setup Instructions (Local Development)

### Backend
```bash
git clone https://github.com/CharithaReddy18/TaskFlow.git
cd TaskFlow/backend
npm install
# Create .env file with values (see Environment Variables section)
npm start
```

### Frontend
```bash
cd ../frontend
npm install
# Create .env file with VITE_API_URL=http://localhost:5000/api
npm run dev
```

## 🔑 Environment Variables

Provide a `.env` file in both `backend` and `frontend` folders.

**Backend (.env)**
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secret_key
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

## 📂 Project Structure

```text
TaskFlow/
├── backend/
│   ├── index.js
│   ├── swagger.js
│   ├── middleware/ (auth.js)
│   ├── models/ (Membership.js, Project.js, Task.js, User.js)
│   ├── routes/ (auth.js, dashboard.js, projects.js, tasks.js)
│   └── tests/ (rbac.test.js)
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/ (Navbar, ProjectModal, TaskModal)
│   │   ├── context/ (AuthContext.jsx)
│   │   └── pages/ (Dashboard, Login, Projects, Signup)
└── README.md
```

## 🧪 Testing

We use `Jest` and `Supertest` to verify backend RBAC logic. The tests prove that a Member cannot delete projects or add members, and cannot access data of projects they don't belong to.

Run the tests in the backend:
```bash
cd backend
npm test
```

## 🔮 Future Scope

- Real-time updates via WebSockets for instant task status changes
- Email notifications for task assignments
- File attachments on tasks
- Comments and activity log
- Audit trail for Admin actions

## 📄 Author and License

Developed by Charitha Reddy. Licensed under the MIT License.
