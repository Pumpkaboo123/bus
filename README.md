# Smart Transit Bus Booking System 🚌

This is a modern, real-time bus tracking and booking application built with React, Node.js, and MongoDB.

## Project Structure
- `/Backend`: Node.js Express server + Socket.io + MongoDB
- `/frontend`: React.js application + Leaflet.js

---

## 🛠 Prerequisites
Before moving this project to another PC, ensure the new PC has the following installed:
1. **Node.js** (v16 or higher)
2. **npm** (comes with Node.js)
3. **MongoDB Community Server** (running on default port 27017)

---

## 🚀 How to Setup and Run

### 1. Extract/Clone the Project
Copy the `Minor` folder to the target PC. 
> **Note:** If you are zipping the folder, **DO NOT** include the `node_modules` folders (they are huge). My `.gitignore` files will handle this if you use Git.

### 2. Setup Database
Ensure your MongoDB service is running. The app connects to `mongodb://127.0.0.1:27017/smartTransit`.

### 3. Install Dependencies
Open two terminals on the target PC:

**Terminal 1 (Backend):**
```bash
cd Backend
npm install
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm start
```

---

## 🔑 Default Admin Account
- **Username:** `admin`
- **Password:** `admin123`

## 📡 Networking Tip (Sharing over Wi-Fi)
If you want to open the website on a different phone or laptop while the server is running on this PC:
1. Find this PC's Local IP address (e.g., `192.168.1.5`).
2. Update the `socket` and `fetch` URLs in `frontend/src/App.js` from `localhost` to your IP.
3. Open `http://YOUR_IP:3000` on the other device.

---
**Report & Documentation:**
- See [Project_Report.html](./Project_Report.html) for the technical documentation.
- See [walkthrough.md](./walkthrough.md) for a summary of features.
