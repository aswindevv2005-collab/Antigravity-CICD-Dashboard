# AWS Native Services CI/CD Pipeline Prototype

A professional full-stack web application prototype that simulates a real-world CI/CD pipeline using AWS Native Services concepts (CodeCommit, CodeBuild, CodeDeploy, CloudWatch, IAM).

## Features

- **Authentication System:** Secure login simulation with Role-Based Access Control (Developer, DevOps Engineer, Admin).
- **Dashboard:** Overview of pipeline executions, success rates, and deployments.
- **Pipeline Execution Viewer:** Visual, step-by-step pipeline flow (Source -> Build -> Test -> Deploy) with real-time status updates and animations.
- **CloudWatch Logs Simulation:** Real-time log output for each stage of the pipeline execution.
- **IAM Roles & Settings:** A simulated view of AWS IAM permissions and user profiles.
- **Dark Mode Design:** A modern, professional DevOps interface styled with Tailwind CSS.

## Tech Stack

- **Framework:** Next.js (App Router, React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management & Database Simulation:** React Context API & LocalStorage

## How to Run

1. Navigate to the project directory:
   ```bash
   cd aws-cicd-pipeline
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login

You can login with any email and password (minimum 6 characters), and select a role (Developer, DevOps Engineer, Admin). The UI will adjust to show your role in the settings and sidebar.
