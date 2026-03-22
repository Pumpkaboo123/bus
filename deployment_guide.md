# Netlify Deployment Guide: Smart Transit 🚀

Netlify is perfect for hosting your **frontend (React)**, but since your project has a **Backend (Node.js)** and **MongoDB**, you'll need to use a "split" deployment strategy.

---

## Step 1: Frontend (Netlify)
Netlify hosts "Static" sites. Your React app fits perfectly here.

1. **Connect GitHub:** Log in to Netlify, click "Add new site" -> "Import from Git" -> Select your `bus` repository.
2. **Base Directory:** Set this to `frontend`.
3. **Build Command:** `npm run build`
4. **Publish Directory:** `frontend/build`
5. **Environment Variables:**
   - Create a variable called `REACT_APP_API_URL`.
   - Set its value to the URL of your Backend (you'll get this in Step 2).

---

## Step 2: Backend (Render.com or Railway.app)
Netlify cannot run your persistent `server.js` file. You should use **Render** (free) for the backend.

1. **Connect GitHub on Render:** Select your repository.
2. **Base Directory:** Set this to `Backend`.
3. **Start Command:** `node server.js`
4. **Environment Variables:**
   - Create `MONGODB_URI`: Set this to your **MongoDB Atlas** string (Step 3).

---

## Step 3: Database (MongoDB Atlas)
Since your PC won't be on 24/7, move your data to the cloud.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a "Shared Cluster" (Free).
3. Under **Network Access**, add `0.0.0.0/0` (this allows your server to connect from anywhere).
4. Get your **Connection String** and update `Backend/server.js` to use it (or use an `.env` file).

---

## ⚠️ Important Code Changes for Production

### 1. Backend Port
In `Backend/server.js`, change the last line from:
```javascript
server.listen(3001);
```
To:
```javascript
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 2. Frontend API URL
In `frontend/src/App.js`, update the socket connection:
```javascript
// Replace localhost with your Render URL
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001');
```

And update the fetch call:
```javascript
fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/buses`)
```

---

### Final Result
- **Frontend:** `https://your-app.netlify.app`
- **Backend:** `https://your-api.onrender.com`
- **Database:** MongoDB Atlas Cloud

This setup ensures your project is live 24/7 and professional! 🌟
