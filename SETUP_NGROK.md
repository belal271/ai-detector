# How to Expose Your App for Testing

This guide will help you expose both frontend and backend so your friend can test the app.

## Prerequisites

1. **Install ngrok**:
   - Download from: https://ngrok.com/download
   - Or install via package manager:
     - Windows: `choco install ngrok`
     - Mac: `brew install ngrok`
     - Linux: Download and extract

2. **Get ngrok auth token**:
   - Sign up at: https://dashboard.ngrok.com/signup
   - Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
   - Run: `ngrok config add-authtoken YOUR_TOKEN`

3. **Install Python dependencies**:
   ```bash
   cd backend
   pip install pyngrok
   ```

## Step-by-Step Setup

### Step 1: Start Backend with Ngrok

**Option A: Using the helper script (Recommended)**
```bash
cd backend
python start_with_ngrok.py
```

**Option B: Manual ngrok**
1. Start backend normally:
   ```bash
   cd backend
   python main.py
   ```

2. In a new terminal, start ngrok:
   ```bash
   ngrok http 8000
   ```

3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Step 2: Update Backend CORS

Edit `backend/main.py` and add your ngrok frontend URL to the `origins` list:

```python
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend-ngrok-url.ngrok.io",  # Add this
]
```

### Step 3: Start Frontend with Ngrok

1. **Start Next.js frontend**:
   ```bash
   cd frontned
   pnpm dev
   ```

2. **In a new terminal, start ngrok for frontend**:
   ```bash
   ngrok http 3000
   ```

3. **Copy the frontend ngrok URL** (e.g., `https://xyz789.ngrok.io`)

### Step 4: Update Frontend Environment

Edit `frontned/.env.local` and add:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-ngrok-url.ngrok.io
```

**Important**: Use the backend ngrok URL here, not localhost!

### Step 5: Restart Both Servers

1. Restart backend (to apply CORS changes)
2. Restart frontend (to load new environment variable)

## Share with Your Friend

Give your friend:
- **Frontend URL**: `https://xyz789.ngrok.io` (the frontend ngrok URL)
- They can access the app normally through this URL

## Important Notes

⚠️ **Ngrok URLs change** every time you restart ngrok (unless you have a paid plan with static domains)

⚠️ **Keep both terminals open** - if you close ngrok, the tunnel stops

⚠️ **Free ngrok has limitations**:
   - URLs change on restart
   - Limited requests per minute
   - Connection timeout after inactivity

## Alternative: Deploy Frontend to Vercel

For a more permanent solution:

1. Push code to GitHub
2. Deploy frontend to Vercel (free)
3. Use ngrok only for backend
4. Update `NEXT_PUBLIC_BACKEND_URL` in Vercel environment variables

This way, your frontend has a permanent URL and only the backend uses ngrok.

