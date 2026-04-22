# 🚀 Anti-Gravity CI/CD Platform

A fully functional, production-ready, custom CI/CD engine built with a futuristic "anti-gravity" UI experience.

## ✨ Features

- **Real CI Engine:** Instead of simulating builds, the backend literally runs `git clone`, `npm install`, `npm test`, and custom bash commands as background processes via Node's `child_process.exec`.
- **Live Socket Telemetry:** Real-time stdout/stderr streams directly to the frontend using WebSockets (`socket.io`).
- **Anti-Gravity UI/UX:** Built with React, Tailwind CSS, and Framer Motion. Features floating nodes, pulsing gradients, and a zero-gravity aesthetic.
- **Docker Containerized:** Production-ready `Dockerfile` and `docker-compose.yml` included.

## 🏗️ Architecture

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express.js + Socket.io
- **Containers:** Docker + Docker Compose
- **Pipeline Config:** Expandable custom bash scripts locally.

## 💻 Local Development Setup

### 1. Start Backend (Port 5001)
```bash
cd backend
npm install
node server.js
```

### 2. Start Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to experience the Anti-Gravity dashboard.

## 🐳 Docker Deployment

To spin up the entire production-ready stack (Frontend + Backend) using Docker:

```bash
docker-compose up --build -d
```
The application will be exposed on port `5173`.

## 🌐 Production Deployment Guide (AWS / Render)

### Backend Deployment (Render / Railway)
1. Push this code to a GitHub repository.
2. Connect the repository to Render/Railway and create a new **Web Service**.
3. Set the Root Directory to `backend/`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Make sure you set the Environment Variables if needed.

### Frontend Deployment (Vercel / Netlify)
1. Create a new project pointing to your repository.
2. Set Root Directory to `frontend/`.
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
*(Note: Update the socket connection string in `src/App.tsx` from `http://localhost:5001` to your production backend URL before deploying).*
