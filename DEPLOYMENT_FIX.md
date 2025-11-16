# Fixing CORS Error in Production

## Issues Fixed

1. ✅ **Double slash in URL** - Fixed in frontend code
2. ✅ **CORS configuration** - Updated backend to accept frontend URL

## Steps to Fix on Render (Backend)

### Option 1: Add Frontend URL to Environment Variables (Recommended)

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Add a new environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://ai-detector-h1zf.vercel.app` (your frontend URL, no trailing slash)
5. **Save Changes** - Render will automatically redeploy

### Option 2: Allow All Origins (For Testing Only)

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add environment variable:
   - **Key**: `ALLOW_ALL_ORIGINS`
   - **Value**: `true`
5. **Save Changes** - Render will automatically redeploy

⚠️ **Warning**: Option 2 allows any website to access your API. Only use for testing!

## Steps to Fix on Vercel (Frontend)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Make sure you have:
   - `NEXT_PUBLIC_BACKEND_URL` = `https://ai-detector-lhup.onrender.com` (no trailing slash!)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Redeploy** your frontend (go to Deployments → click the 3 dots → Redeploy)

## Verify the Fix

1. Check backend logs on Render - you should see: `Allowed CORS origins: [...]`
2. Check browser console - the CORS error should be gone
3. Try analyzing text again

## Common Issues

### Still getting CORS error?
- Make sure `FRONTEND_URL` in backend matches your frontend URL exactly (no trailing slash)
- Make sure `NEXT_PUBLIC_BACKEND_URL` in frontend matches your backend URL exactly (no trailing slash)
- Redeploy both services after making changes

### Backend URL has trailing slash?
The code now automatically removes trailing slashes, but double-check your environment variables don't have them.

