# CI/CD Pipeline Web Application using Python (Flask) and GitHub Actions

## 📌 Project Overview
This repository contains a full-stack, professional-grade Continuous Integration and Continuous Deployment (CI/CD) project. It replaces a standard console application with a robust Python Flask backend and a modern UI frontend. The CI pipeline validates the web service and its configuration using automated testing to ensure 100% production readiness without deploying a background process that halts verification.

## ✨ Features
- **Modern Dashboard**: A highly polished, dark-theme web dashboard powered by HTML5 and advanced Vanilla CSS.
- **Python Flask Backend**: A lightweight, efficient application backend serving routes and determining system logic.
- **`antigravity` Integration**: Safely integrates the built-in python easter-egg module into a secure web application workflow without interfering with testing.
- **Automated Testing Suite**: Implements `pytest` to automatically test the web application routes when deploying.
- **Automated CI/CD**: Seamless GitHub Actions configuration running on Ubuntu to validate dependencies and app HTTP response integrity.

## 🛠️ Technologies Used
- **Backend:** Python 3.10, Flask
- **Frontend:** HTML5, CSS3 (Glassmorphism, CSS Variables, Animations)
- **CI/CD:** GitHub Actions, `pytest` for automated test execution
- **Version Control:** Git

## ⚙️ How CI/CD Works in This Project
Continuous Integration dictates that the main repository codebase remains stable and continuously tested.
1. When a change is pushed to the `main` branch, a webhook triggers the GitHub Actions CI pipeline.
2. The Ubuntu server initializes and fetches the complete codebase.
3. Automatically scaffolds the Python 3.10 environment and dynamically installs requirements (`Flask`, `pytest`).
4. Instead of perpetually running a live server in the background (which would hang a CI deployment script), the pipeline utilizes a `pytest` suite (`test_app.py`) to systematically map the Flask routes, verify successful `200` status codes, and mathematically validate HTML payloads.
5. If the tests succeed, the pipeline is evaluated as healthy, guaranteeing a deployment success status for your project.

## 💻 Setup Instructions

### To run the Web Application Locally:
1. Ensure Python 3.10 is installed.
2. Install the necessary dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask application:
   ```bash
   python app.py
   ```
4. Once the server starts, open `http://127.0.0.1:5000` in your web browser to view the dynamic dashboard!

### To view the Pipeline run on GitHub:
1. Initialize a git repository locally: `git init` and commit all files.
2. Create an empty repository on GitHub and link the origin.
3. Once pushed, navigate to the **Actions** tab of your GitHub repository.
4. Watch as GitHub provisions the Ubuntu environment, installs Flask, and formally tests the web application successfully!
