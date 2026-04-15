# Deployment Guide - Smart Office Access

## Deploying Backend to Render

This guide walks through hosting the backend API on Render (https://render.com), a cloud platform that supports Node.js applications.

### Prerequisites

- Render account (free tier available at https://render.com)
- GitHub account with this repository pushed
- (Optional) Firebase credentials for persistent logging

### Step 1: Connect GitHub to Render

1. Go to https://render.com and sign up / log in
2. Click **New +** → **Web Service**
3. Click **Connect a repository**
4. Authorize GitHub and select `kunal-1069/Attendance`
5. Click **Connect**

### Step 2: Configure Web Service

On the Render dashboard:

- **Name**: `smart-office-backend` (or your choice)
- **Runtime**: Node
- **Build Command**: `cd Backend && npm install`
- **Start Command**: `cd Backend && npm start`
- **Instance Type**: Free (or higher if needed)

### Step 3: Add Environment Variables

In the Render dashboard under "Environment Variables":

```
PORT=0
NODE_ENV=production
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
```

Leave `PORT=0` to let Render assign the port automatically.

If you skip Firebase credentials, the backend will run in local simulation mode (logs stored in memory).

### Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy
3. Once deployed, you'll get a URL: `https://smart-office-backend.onrender.com`

### Step 5: Update Frontend to Use Production URL

After deployment, update your app to point to the Render backend.

#### For Expo Web

Set the environment variable before running:

```bash
set EXPO_PUBLIC_API_BASE_URL=https://smart-office-backend.onrender.com
npm run web
```

Or add to `.env.local` in the SmartOfficeAccess folder:

```
EXPO_PUBLIC_API_BASE_URL=https://smart-office-backend.onrender.com
```

#### For React Native (iOS/Android)

Update `SmartOfficeAccess/app.json` to include:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://smart-office-backend.onrender.com"
    }
  }
}
```

Then update `src/services/api.js` to read from the config:

```javascript
import Constants from 'expo-constants';

const resolveBaseUrl = () => {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBaseUrl) {
    return stripTrailingSlash(envBaseUrl);
  }

  const configUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (configUrl) {
    return stripTrailingSlash(configUrl);
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
};
```

### Verifying Deployment

Check the backend is live:

```bash
curl https://smart-office-backend.onrender.com/
```

Expected response:

```json
{
  "message": "Smart Office Access Backend is running."
}
```

### Test an Endpoint

```bash
curl -X POST https://smart-office-backend.onrender.com/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneOrEmail":"test@example.com"}'
```

### Scaling & Monitoring

- **Logs**: View in Render dashboard → Logs
- **Uptime**: Render monitors and auto-restarts on failure
- **Scaling**: Upgrade instance type for higher traffic
- **Updates**: Push to `main` branch to trigger auto-deploy

### Cold Starts

Free tier services on Render sleep after 15 minutes of inactivity. The first request after sleep may take 30+ seconds. For production, upgrade to a paid instance.

### Troubleshooting

**502 Bad Gateway**
- Check backend logs in Render dashboard
- Verify all environment variables are set
- Ensure build command succeeded

**Logs not persisting**
- Add Firebase credentials to enable Firestore persistence
- Without Firebase, logs are stored in memory (lost on restart)

**Frontend can't reach backend**
- Verify URL is correct: `https://your-service.onrender.com`
- Check CORS headers are enabled (they are by default in backend)
- Test endpoint directly with curl

### Next: Deploy Frontend (Optional)

To deploy the Expo web app to a hosting service:

1. Build Expo web: `npm run build`
2. Deploy the `web-build/` folder to Vercel, Netlify, or GitHub Pages

---

For more details on Render, visit: https://render.com/docs
