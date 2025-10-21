# Deployment Guide for Vercel

## Quick Fix for the 404 Error

You were experiencing a 404 error when accessing routes directly because Vercel needs special configuration for Single Page Applications (SPAs) using React Router.

### What We Fixed

1. **Created `frontend/vercel.json`** - This tells Vercel to route all requests to `index.html` for client-side routing
2. **Created `frontend/src/config.js`** - Centralized API URL configuration
3. **Updated all API calls** - Replaced hardcoded `localhost:5000` with dynamic `API_URL`

## Deployment Steps

### Step 1: Update Backend URL

**Find your deployed backend URL:**
1. Go to your Vercel dashboard
2. Find your backend project
3. Copy the production URL (e.g., `https://your-backend-name.vercel.app`)

**Update the frontend config:**
Open `frontend/src/config.js` and replace:
```javascript
return import.meta.env.VITE_API_URL || 'https://your-backend-url.vercel.app';
```

With your actual backend URL:
```javascript
return import.meta.env.VITE_API_URL || 'https://delivery-app-backend-xxxxx.vercel.app';
```

### Step 2: Deploy to Vercel

#### Option A: Using Git (Recommended)

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Fix SPA routing and API configuration for production"
   git push origin master
   ```

2. **Vercel will automatically redeploy** both frontend and backend

#### Option B: Using Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Deploy backend:**
   ```bash
   cd ../backend
   vercel --prod
   ```

### Step 3: Configure Environment Variables on Vercel (Optional but Recommended)

Instead of hardcoding the backend URL, you can use environment variables:

1. Go to your **frontend project** on Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** Your backend URL (e.g., `https://delivery-app-backend-xxxxx.vercel.app`)
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**
5. **Redeploy** your frontend for changes to take effect

### Step 4: Verify Backend CORS Settings

Make sure your backend allows requests from your frontend domain:

In `backend/server.js`, ensure CORS is configured:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',  // Local development
    'https://your-frontend-url.vercel.app'  // Production
  ],
  credentials: true
}));
```

## Troubleshooting

### 404 Error on Direct Route Access
- ✅ **Fixed!** The `vercel.json` file now handles this

### API Connection Errors
- Check that the backend URL in `config.js` is correct
- Verify backend is deployed and running on Vercel
- Check browser console for CORS errors
- Ensure backend CORS allows your frontend domain

### WebSocket Connection Issues
- WebSocket connections use the same URL as HTTP requests
- Vercel supports WebSocket connections
- Check that `socket.io` is properly configured in backend

### Environment Variables Not Working
- Variable names must start with `VITE_` for Vite to expose them
- Redeploy after adding environment variables
- Check Vercel deployment logs

## Testing the Deployment

After deployment, test these scenarios:

1. ✅ **Direct URL access:** `yoursite.com/login` should work
2. ✅ **Page refresh:** Refreshing on any route should work
3. ✅ **Registration:** Should connect to backend API
4. ✅ **Login:** Should authenticate successfully
5. ✅ **Real-time updates:** Socket.io should connect

## Files Modified

- ✅ `frontend/vercel.json` - SPA routing configuration
- ✅ `frontend/src/config.js` - API URL configuration
- ✅ `frontend/src/contexts/AuthContext.jsx` - Updated API calls
- ✅ `frontend/src/contexts/SocketContext.jsx` - Updated WebSocket URL
- ✅ `frontend/src/pages/Cart.jsx` - Updated API calls
- ✅ `frontend/src/pages/Orders.jsx` - Updated API calls
- ✅ `frontend/src/pages/OrderTracking.jsx` - Updated API calls
- ✅ `frontend/src/pages/AvailableOrders.jsx` - Updated API calls
- ✅ `frontend/src/pages/AdminDashboard.jsx` - Updated API calls

## Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure both backend and frontend are deployed successfully

