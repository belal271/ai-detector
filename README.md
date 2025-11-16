# AI Detector - Plagiarism and AI Content Detection

A full-stack application for detecting AI-generated content and online plagiarism in student submissions.

## Features

- 🔐 **Authentication**: Supabase-based user authentication
- 🤖 **AI Detection**: Advanced AI-generated text detection using Google Gemini
- 📄 **Plagiarism Detection**: Identifies content copied from online sources
- 📊 **Dashboard**: View submission history and detailed reports
- 👥 **Role-Based Access**: Students, Teachers, and Admins with different access levels

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Authentication)

### Backend
- FastAPI
- Python
- Google Gemini AI
- Supabase (Database)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.8+
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-detector
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
   
   Create `backend/.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Frontend Setup**
   ```bash
   cd frontned
   pnpm install
   ```
   
   Create `frontned/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

### Running the Application

1. **Start Backend**
   ```bash
   cd backend
   python main.py
   ```
   Backend runs on `http://localhost:8000`

2. **Start Frontend**
   ```bash
   cd frontned
   pnpm dev
   ```
   Frontend runs on `http://localhost:3000`

### Exposing for Testing

See `QUICK_START_NGROK.md` for instructions on exposing the app using ngrok.

## Project Structure

```
ai-detector/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── services.py       # AI analysis services
│   └── requirements.txt  # Python dependencies
├── frontned/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utilities and Supabase clients
│   └── public/           # Static assets
└── README.md
```

## Environment Variables

### Backend (.env)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Service role key (bypasses RLS)
- `SUPABASE_ANON_KEY`: Anonymous key
- `GEMINI_API_KEY`: Google Gemini API key
- `ALLOW_ALL_ORIGINS`: Set to `true` for testing with ngrok

### Frontend (.env.local)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anonymous key
- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL

## Database Schema

The `submissions` table structure:
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `user_name`: Text
- `content`: JSONB (contains `{text: "..."}`)
- `report`: JSONB (contains analysis results)
- `created_at`: Timestamp

Row-Level Security (RLS) is configured:
- Students: Can only see their own submissions
- Teachers: Can see all student submissions + their own
- Admins: Can see all submissions

## API Endpoints

### POST `/analyze-document`
Analyzes text for AI generation and plagiarism.

**Headers:**
- `Authorization: Bearer <supabase_jwt_token>`

**Body:**
```json
{
  "text": "Text to analyze"
}
```

**Response:**
```json
{
  "status": "success",
  "report": {
    "ai_likelihood": "High|Medium|Low",
    "ai_reasoning": "...",
    "online_sources": [...],
    "online_sources_count": 0
  },
  "submission_id": "..."
}
```

## License

[Your License Here]

## Contributing

[Contributing guidelines]

