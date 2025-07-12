# Vercel Environment Variables Setup

To fix the CORS error, you need to set up environment variables in your Vercel deployment.

## Steps to Fix CORS Issue:

### 1. Go to Vercel Dashboard
- Visit https://vercel.com/dashboard
- Select your project (emote-moder)

### 2. Add Environment Variables
- Go to **Settings** → **Environment Variables**
- Add the following environment variable:

**Variable Name:** `VITE_API_BASE`
**Value:** `https://emotemoder.onrender.com`
**Environment:** Production, Preview, Development

### 3. Redeploy
- After adding the environment variable, redeploy your application
- Go to **Deployments** → Click **Redeploy** on your latest deployment

## What This Fixes:

1. **CORS Error**: The backend now allows requests from `https://emote-moder.vercel.app`
2. **API Configuration**: All frontend components now use the correct production API URL
3. **Environment Consistency**: Standardized API base URL across all components

## Backend Changes Made:

- Added `https://emote-moder.vercel.app` to allowed CORS origins
- Added preflight request handling
- Enhanced CORS headers for better compatibility

## Frontend Changes Made:

- Created centralized configuration (`src/config.js`)
- Standardized API base URL usage across all components
- Added automatic production URL detection

## Test the Fix:

After setting up the environment variable and redeploying:

1. Clear your browser cache
2. Try registering/logging in again
3. Check the browser console for any remaining CORS errors

The error should now be resolved! 🎉 