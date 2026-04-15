# Smart Office Access - Project README

This repository contains a Smart Office Access system with:
- A Node.js backend API
- A React Native + Expo frontend app
- A static web prototype UI

## Project Structure

- `Backend/`: Express API for OTP and IoT access events
- `SmartOfficeAccess/`: Expo app (mobile + web)
- `index.html`, `styles.css`, `app.js`: standalone static web prototype

## Prerequisites

- Node.js 18+
- npm
- Expo CLI is not required globally (uses local `expo` from dependencies)

## Quick Start (Full Project)

Open separate terminals for backend and frontend.

### 1) Start Backend API

```bash
cd Backend
npm install
npm start
```

Expected:
- API running on `http://localhost:5000`

### 2) Start Frontend (Expo)

```bash
cd SmartOfficeAccess
npm install
npm run web
```

Expected:
- Expo web UI running on `http://localhost:8081` (or next available port)

### 3) Optional: Open Static Prototype UI

Open `index.html` directly in a browser, or serve the root folder with any static server.

## Environment Setup (Backend)

1. Copy the example file:

```bash
cd Backend
copy .env.example .env
```

2. Update `.env` values for Firebase if you want Firestore/Storage persistence.

Notes:
- Without Firebase credentials, backend still runs in local simulation mode.
- `.env` files are ignored by git; `.env.example` is tracked.

## Frontend-Backend Connection

The Expo app uses `SmartOfficeAccess/src/services/api.js` to resolve the API base URL.

Default behavior:
- Web/iOS: `http://localhost:5000`
- Android emulator: `http://10.0.2.2:5000`

Override with:
- `EXPO_PUBLIC_API_BASE_URL`

Example for physical device on same Wi-Fi:

```bash
set EXPO_PUBLIC_API_BASE_URL=http://192.168.1.9:5000
npm run web
```

## Key API Endpoints

Base URL: `http://localhost:5000`

Auth:
- `POST /api/auth/otp/request`
- `POST /api/auth/otp/verify`

IoT / Access:
- `POST /api/iot/rfid`
- `POST /api/iot/fingerprint`
- `POST /api/iot/face` (multipart image)
- `POST /api/iot/face/simulate`
- `GET /api/iot/logs?limit=100`

## Live Activity Log

The Activity Log screen in the Expo app is connected to backend logs.
It:
- Fetches from `GET /api/iot/logs`
- Polls every 5 seconds
- Supports manual refresh from the UI

## Troubleshooting

### PowerShell script policy blocks npm
Use `npm.cmd` instead of `npm`:

```bash
npm.cmd install
npm.cmd start
```

### Port already in use
- Backend default: `5000`
- Expo web default: `8081` (Expo will auto-prompt for another port)

### No activity appears
- Ensure backend is running
- Trigger events from dashboard actions (OTP, fingerprint, face)
- Verify logs endpoint directly: `http://localhost:5000/api/iot/logs?limit=5`

## Deployment

### Backend on Render

The backend is configured for easy deployment to [Render](https://render.com):

1. Push code to GitHub (already done)
2. Connect GitHub to Render
3. Set environment variables (Firebase credentials optional)
4. Deploy — Render auto-builds and starts the service

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guide.

Production URL example: `https://smart-office-backend.onrender.com`

### Frontend with Production Backend

After deploying backend, set the Render URL in your environment:

```bash
set EXPO_PUBLIC_API_BASE_URL=https://your-service.onrender.com
npm run web
```

## Tech Stack

- Backend: Express, CORS, Multer, Firebase Admin (optional)
- Frontend: React Native, Expo, React Navigation
- Prototype UI: HTML/CSS/Vanilla JS
- Deployment: Render (Node.js hosting)
