# 🚀 Professional CI/CD Dashboard Architecture

This project is a real-world, production-ready CI/CD dashboard that integrates directly with GitHub Actions using secure APIs, Redis queues, and MongoDB. It completely replaces the mock local execution with actual workflow dispatching and tracking.

## 🏗️ Architecture Overview

- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion. Uses WebSockets for real-time log streaming.
- **Backend**: Node.js + Express + Socket.io. Uses `octokit` to communicate with the GitHub REST API securely.
- **Queue System**: Redis + BullMQ for asynchronous job processing so the API remains highly responsive.
- **Database**: MongoDB via Mongoose to store pipeline run history, GitHub Run IDs, and status logs.
- **Containerization**: Full Docker support with Dockerfiles for both services and a `docker-compose.yml` for local infrastructure (Redis + MongoDB).

## 📂 Project Structure
```text
pro-cicd-dashboard/
├── backend/
│   ├── models/
│   │   └── Pipeline.js      # Mongoose schema
│   ├── server.js            # Express API, BullMQ Worker, Octokit integration
│   ├── Dockerfile           # Node.js backend Dockerfile
│   └── package.json         
├── frontend/
│   ├── src/
│   │   └── App.tsx          # Real-time dashboard UI
│   ├── Dockerfile           # Multi-stage Nginx Dockerfile
│   ├── package.json
│   └── tailwind.config.js
├── .github/
│   └── workflows/
│       └── ci.yml           # Template GitHub Action to place in target repos
└── docker-compose.yml       # Local infrastructure (Redis + Mongo)
```

## 💻 Local Development Setup

### 1. Start Infrastructure (Redis & MongoDB)
```bash
cd pro-cicd-dashboard
docker-compose up -d
```

### 2. Configure Backend
```bash
cd pro-cicd-dashboard/backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cicd
REDIS_HOST=localhost
REDIS_PORT=6379
GITHUB_TOKEN=ghp_your_personal_access_token_here
```
*(Generate a Classic Personal Access Token in GitHub with `repo` and `workflow` scopes).*
```bash
npm run dev
```

### 3. Configure Frontend
```bash
cd pro-cicd-dashboard/frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. 

## 🌐 How It Works (Real Integration)
1. You enter a GitHub repository URL in the UI (e.g., `https://github.com/your-org/your-repo`).
2. The Frontend sends a `POST /api/pipeline` request to the Backend.
3. The Backend creates a Mongoose record and pushes a job to the **BullMQ** Redis Queue.
4. The BullMQ Worker picks up the job and uses `Octokit` to trigger a `workflow_dispatch` event on GitHub.
5. The Worker automatically polls the GitHub REST API to find the newly generated Run ID.
6. Once the run starts, the Backend polls the status and streams updates to the Frontend via **WebSockets**.
7. The Frontend dynamically updates the pipeline nodes (Build, Test, Deploy) based on the actual GitHub Action's status.

## 🚀 Production Deployment Guide (Render / Railway)

### 1. Provision Managed Services
- Provision a **Managed PostgreSQL or MongoDB** cluster.
- Provision a **Managed Redis** instance.

### 2. Backend Deployment
- Connect your repository to Render/Railway as a **Web Service**.
- Set Build Command: `npm install`
- Set Start Command: `npm start`
- Add Environment Variables: `MONGO_URI`, `REDIS_HOST`, `REDIS_PORT`, `GITHUB_TOKEN`.

### 3. Frontend Deployment
- Update `App.tsx` socket and axios URLs from `localhost:5000` to your deployed backend URL.
- Deploy the `frontend/` directory to Vercel, Netlify, or Render Static Site.
- Set Build Command: `npm run build`
- Set Publish Directory: `dist`
