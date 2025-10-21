# 🚀 Quick Setup - Fix 404 Errors on Vercel

## What Was the Problem?
Your frontend was trying to connect to `localhost:5000` even in production, and direct URL access (like `/login`) was returning 404 errors.

## What I Fixed ✅

1. **Created `frontend/vercel.json`** - Fixes 404 errors on direct route access
2. **Created `frontend/src/config.js`** - Dynamic API URL configuration
3. **Updated ALL API calls** - Changed from `localhost:5000` to use the config

## What You Need to Do NOW 🎯

### 1. Find Your Backend URL
Go to Vercel Dashboard → Your Backend Project → Copy the URL
Example: `https://delivery-app-backend-abc123.vercel.app`

### 2. Update the Config File
Open `frontend/src/config.js` and change line 7:

**BEFORE:**
```javascript
return import.meta.env.VITE_API_URL || 'https://your-backend-url.vercel.app';
```

**AFTER (use YOUR actual backend URL):**
```javascript
return import.meta.env.VITE_API_URL || 'https://delivery-app-backend-abc123.vercel.app';
```

### 3. Commit and Push
```bash
git add .
git commit -m "Fix SPA routing and production API URL"
git push origin master
```

### 4. Wait for Vercel to Deploy
Vercel will automatically redeploy your frontend.

## Test It! 🧪

After deployment, try:
1. Direct access: `yoursite.com/login` ✅
2. Refresh on any page ✅
3. Register a new user ✅
4. Login ✅

## Alternative: Use Environment Variables (Recommended)

Instead of hardcoding, you can use Vercel environment variables:

1. Go to Vercel Dashboard → Frontend Project → Settings → Environment Variables
2. Add:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.vercel.app`
3. Save and redeploy

This way, you don't need to modify the code!

---

**Need the deployment guide?** Check `DEPLOYMENT.md` for detailed instructions.

