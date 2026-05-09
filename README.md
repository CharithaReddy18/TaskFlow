# Team Task Manager

A Full-Stack web application where users can create projects, assign tasks, and track progress with role-based access control (Admin/Member). 
Built using the **MERN Stack** (MongoDB, Express, React, Node.js).

## 🚀 Key Features

- **Authentication:** Secure Signup and Login using JWT and bcrypt.
- **Role-Based Access Control:** 
  - **Admin:** Can create projects, create tasks, and assign tasks to users.
  - **Normal User:** Can view their assigned tasks and update the task status.
- **Project & Team Management:** Group tasks under specific projects.
- **Task Management:** Create tasks with categories (User Research, UI Design, Coding) and statuses (Pending, In Progress, Completed).
- **Dashboard:** Visual overview of tasks by status and category.
- **Premium UI:** Glassmorphism design with modern aesthetics and responsiveness.

## 🛠 Tech Stack

- **Frontend:** React, Vite, React Router, Context API, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (using Mongoose ODM).

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd TaskFlow
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/taskflow # Or your MongoDB Atlas URI
   JWT_SECRET=your_super_secret_key
   ```
   Start the backend:
   ```bash
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

## 🌐 Railway Deployment Guide (Mandatory)

To deploy this project to Railway, follow these steps:

1. Create a GitHub repository and push this entire project to it.
2. Log in to [Railway.app](https://railway.app/).
3. Click **New Project** -> **Deploy from GitHub repo**.
4. Select your repository.
5. Railway will detect the `backend` and `frontend` folders. 

**For the Backend Service:**
- Go to the service settings.
- Set the Root Directory to `/backend`.
- Add Variables:
  - `MONGO_URI`: Your MongoDB Atlas URI.
  - `JWT_SECRET`: A secure random string.
  - `PORT`: 5000

**For the Frontend Service:**
- Go to the service settings.
- Set the Root Directory to `/frontend`.
- Add Variables:
  - `VITE_API_URL`: The public URL of your deployed Backend service (e.g., `https://your-backend-url.up.railway.app/api`).
- **Important:** Ensure the frontend build command is `npm run build` and start command is `npm run preview` or use a static host for Vite.

## 📦 Submission Details
Ensure to provide:
- Live URL
- GitHub Repo Link
- 2-5 min demo video (Use Loom, OBS, or similar to record your screen showcasing the live URL and all features).
