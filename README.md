# 🌍 Carbon Compass

**Carbon Compass** is an interactive platform designed to empower individuals and businesses to understand and reduce their carbon footprints. With a comprehensive calculator, AI-driven insights, and a competitive leaderboard, the platform motivates users to take climate-positive action.

---

## 📚 Table of Contents

- [🌟 Overview](#-overview)
- [🎯 Aim](#-aim)
- [✨ Features](#-features)
- [🧱 Tech Stack](#-tech-stack)
- [⚙️ Setup and Installation](#setup-and-installation)
- [🚀 Usage](#-usage)
- [🤝 Contributing](#-contributing)

---

## 🌟 Overview

**Carbon Compass** helps individuals and organizations track, analyze, and reduce their carbon footprints. By integrating AI-powered recommendations and gamification elements, the app makes sustainability engaging and impactful.

---

## 🎯 Aim

- Build an interactive platform to understand and reduce carbon emissions.
- Offer a comprehensive carbon footprint calculator tailored to user inputs.
- Promote eco-conscious behavior through a gamified leaderboard system.
- Reward businesses and users with carbon credits and achievements.

---

## ✨ Features

### 🧮 Carbon Calculator
- Estimates emissions based on transportation, energy, diet, and lifestyle data.
- Integrates additional inputs like waste generation for more accurate results.

### 🧠 AI-Powered Insights
- Uses Gemini API to provide personalized carbon reduction suggestions.
- Helps users identify impactful changes and make smarter decisions.

### 📊 Goal Tracker
- Track progress toward emission reduction targets.
- Visual metrics and milestone highlights keep users engaged.

### 🏆 Leaderboard & Rewards
- Compare with others on the leaderboard.
- Earn points and carbon credits for sustainable actions.

### ⚡ Optimized Performance
- Local storage caching for faster access and improved app performance.
- Consistent data retrieval and offline-friendly experience.

---

## 🧱 Tech Stack

| Layer         | Technology                     |
|---------------|--------------------------------|
| Frontend      | React.js, TypeScript           |
| AI & Insights | Gemini API                     |
| Backend DB    | Firebase Firestore             |
| Auth          | Firebase Authentication        |
| Deployment    | Vercel                         |

---

## ⚙️ Setup and Installation

### ✅ Prerequisites
- Node.js (v14 or later)
- npm

### 📥 Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/bondilirithika/carbon-compass
   cd carbon-compass
   ```
2. **Install Dependencies**:

```bash
npm install
```
3.**Firebase Setup:**

Go to Firebase Console

- Create a project

- Enable Authentication and Cloud Firestore

- Download your Firebase configuration file and save it as src/firebaseConfig.js

**Environment Variables:** Create a .env file in the root directory:

```.env

REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```
**Run the Application:**

```bash

npm start
```
The app should now be running at http://localhost:3000.

## 🚀 usage
**🔐 Authentication**
- Users can register and log in using Firebase Authentication.

**📊 Dashboard**
Access dashboard features:

- Fill out the carbon tracking form

- View AI-powered insights

- Track carbon reduction goals

- Compete on the leaderboard

🔄 Data Flow
- User inputs → Firestore → Gemini API → Personalized insights

- Data also cached in local storage for improved speed and offline access

## 🤝 contributing
We welcome contributions from the community!

Fork the repository

Create a new branch:

``` bash

git checkout -b feature/your-feature-name
```
Make your changes and commit:

```bash

git commit -m "Add: Your feature description"
```
Push your branch and open a Pull Request:

```bash

git push origin feature/your-feature-name
```
🌱 Let’s build a more sustainable future, one click at a time.
