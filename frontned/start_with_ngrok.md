# Exposing Frontend with Ngrok

## Option 1: Using Ngrok (Quick Testing)

1. **Install ngrok** (if not already installed):
   - Download from: https://ngrok.com/download
   - Or use: `choco install ngrok` (Windows) or `brew install ngrok` (Mac)

2. **Start your Next.js frontend**:
   ```bash
   cd frontned
   pnpm dev
   ```

3. **In a new terminal, start ngrok for frontend**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Update backend CORS** to include your ngrok frontend URL in `backend/main.py`

6. **Update frontend environment** - Add to `frontned/.env.local`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-ngrok-url.ngrok.io
   ```

## Option 2: Deploy Frontend to Vercel (Recommended for Production)

1. **Push your code to GitHub**

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_BACKEND_URL` (your ngrok backend URL)

3. **Update backend CORS** to include your Vercel URL

