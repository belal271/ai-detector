# Quick Start: Expose App with Ngrok

## Fast Setup (5 minutes)

### 1. Install Ngrok
```bash
# Windows (with Chocolatey)
choco install ngrok

# Or download from: https://ngrok.com/download
```

### 2. Authenticate Ngrok
```bash
ngrok config add-authtoken YOUR_TOKEN
# Get token from: https://dashboard.ngrok.com/get-started/your-authtoken
```

### 3. Start Backend with Ngrok

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Ngrok for Backend:**
```bash
ngrok http 8000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) - this is your **BACKEND_URL**

### 4. Update Backend CORS (Quick Method)

Edit `backend/.env` and add:
```env
ALLOW_ALL_ORIGINS=true
```
This allows any frontend URL to connect (for testing only!)

### 5. Start Frontend with Ngrok

**Terminal 3 - Frontend:**
```bash
cd frontned
pnpm dev
```

**Terminal 4 - Ngrok for Frontend:**
```bash
ngrok http 3000
```
Copy the HTTPS URL (e.g., `https://xyz789.ngrok.io`) - this is your **FRONTEND_URL**

### 6. Update Frontend Environment

Edit `frontned/.env.local` and add:
```env
NEXT_PUBLIC_BACKEND_URL=https://abc123.ngrok.io
```
(Use the backend ngrok URL from step 3)

### 7. Restart Frontend
```bash
# Stop frontend (Ctrl+C) and restart
cd frontned
pnpm dev
```

## Share with Friend

Give them the **FRONTEND_URL** from step 5: `https://xyz789.ngrok.io`

They can access the app normally!

## Important Notes

⚠️ **Keep all 4 terminals open** - closing ngrok stops the tunnel

⚠️ **URLs change** - Each time you restart ngrok, you get a new URL (unless paid plan)

⚠️ **For production**: Deploy frontend to Vercel and only use ngrok for backend

