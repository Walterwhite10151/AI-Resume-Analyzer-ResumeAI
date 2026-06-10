# ResumeAI — AI-Powered ATS Resume Analyzer

A full-stack SaaS web application that analyzes resumes using Google Gemini AI 
and provides detailed ATS compatibility scores, keyword optimization suggestions, 
and job description matching to help job seekers land more interviews.

## What it does
- Uploads PDF/DOCX resumes and extracts text automatically
- Generates 5 detailed scores: ATS, Keywords, Readability, Formatting, Overall
- Identifies missing and existing keywords with density analysis
- Detects skills, experience, education, certifications and projects
- Provides AI-generated strengths, weaknesses and actionable recommendations
- Matches resume against any job description with a percentage match score
- Stores full analysis history with delete and re-run support
- Admin dashboard with system statistics and user management

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Recharts
- Backend: FastAPI, Python 3.11, SQLAlchemy, PostgreSQL, Alembic
- AI: Google Gemini AI (via REST API)
- Auth: JWT + bcrypt
- Deploy: AWS Amplify (frontend) + FastAPI Cloud (backend) + Neon (database)

## Built by
Martin — full-stack developer
A production-ready full-stack SaaS application that analyzes resumes using Claude AI, providing ATS scoring, keyword optimization, and job match analysis.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Claude AI](https://img.shields.io/badge/Claude-Sonnet_4-purple)

---

## ✨ Features

- **AI-Powered ATS Scoring** — Claude analyzes resume against ATS criteria (0–100)
- **5 Detailed Score Metrics** — ATS, Keywords, Readability, Formatting, Overall
- **Keyword Analysis** — Found vs. missing keywords with density stats
- **Job Match Analysis** — Compare resume against any job description
- **Skills Extraction** — Auto-detect skills, experience, education, certifications
- **AI Recommendations** — Actionable strengths, weaknesses, and improvements
- **Analysis History** — View, re-analyze, and delete past analyses
- **Dark Mode UI** — Modern glassmorphism design with Recharts dashboards
- **Admin Dashboard** — System stats, user management, analytics
- **JWT Auth** — Secure registration, login, protected routes

---

## 🛠 Tech Stack

| Layer     | Technology                                      |
|-----------|------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend   | FastAPI, Python 3.12, SQLAlchemy, Pydantic     |
| Database  | PostgreSQL 16                                   |
| AI        | Anthropic Claude (claude-sonnet-4)              |
| Auth      | JWT + bcrypt                                    |
| Deploy    | Docker, Docker Compose                          |

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 16
- An [Anthropic API key](https://console.anthropic.com/)

---

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd ai-resume-analyzer



### 2. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE resume_analyzer;"
```

---

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your DATABASE_URL and ANTHROPIC_API_KEY
```

#### Run database migrations:

```bash
# From backend/ directory (venv activated)
alembic upgrade head
```

#### Seed admin user:

```bash
python seed.py
# Creates: admin@resumeanalyzer.com / Admin@123456
```

#### ▶️ Start the backend server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: **http://localhost:8000**  
API docs at: **http://localhost:8000/api/docs**

---

### 4. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# ▶️ Start the dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

> The Vite dev server automatically proxies `/api` requests to `http://localhost:8000`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/resume_analyzer` |
| `SECRET_KEY` | JWT signing secret (min 32 chars) | **Required** |
| `GROK_API_KEY` | Your Grok API key | **Required** |
| `DEBUG` | Enable debug mode | `false` |
| `UPLOAD_DIR` | File upload directory | `uploads` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiry | `1440` (24h) |
| `ALLOWED_ORIGINS` | CORS origins (JSON array) | `["http://localhost:5173"]` |

---

## 🐳 Docker Setup

### One-command start:

```bash
# From project root
cp .env.example .env
# Edit .env with ANTHROPIC_API_KEY and SECRET_KEY

docker compose up --build
```

App will be available at **http://localhost**

### Individual service commands:

```bash
# Start only the database
docker compose up db -d

# View logs
docker compose logs -f backend

# Stop everything
docker compose down

# Reset database (destructive!)
docker compose down -v
```

---

## 📁 Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── api/routes/         # FastAPI route handlers
│   │   │   ├── auth.py         # Register, login
│   │   │   ├── users.py        # Profile management
│   │   │   ├── resumes.py      # Upload, list, delete
│   │   │   ├── analysis.py     # AI analysis, job match
│   │   │   └── admin.py        # Admin stats
│   │   ├── core/
│   │   │   ├── config.py       # Pydantic settings
│   │   │   └── security.py     # JWT, password hashing
│   │   ├── database/
│   │   │   └── session.py      # SQLAlchemy session
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── ai_service.py   # Claude AI integration
│   │   │   └── file_service.py # PDF/DOCX text extraction
│   │   └── main.py             # FastAPI app entrypoint
│   ├── alembic/                # Database migrations
│   ├── requirements.txt
│   ├── seed.py                 # Admin user seeder
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Layout
│   │   │   └── ui/             # ScoreRing, ScoreBar, etc.
│   │   ├── pages/              # Route page components
│   │   ├── services/api.ts     # Axios client
│   │   ├── store/authStore.ts  # Zustand auth state
│   │   ├── types/index.ts      # TypeScript interfaces
│   │   └── App.tsx             # Router
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, get JWT |
| `GET`  | `/api/users/me` | Get current user |
| `PUT`  | `/api/users/me` | Update profile |
| `POST` | `/api/resumes/upload` | Upload PDF/DOCX |
| `GET`  | `/api/resumes/` | List user's resumes |
| `DELETE` | `/api/resumes/{id}` | Delete resume |
| `POST` | `/api/analysis/analyze/{resume_id}` | Run AI analysis |
| `POST` | `/api/analysis/job-match` | Job match analysis |
| `GET`  | `/api/analysis/history` | Analysis history |
| `GET`  | `/api/analysis/{id}` | Get analysis by ID |
| `DELETE` | `/api/analysis/{id}` | Delete analysis |
| `GET`  | `/api/admin/stats` | Admin statistics |
| `GET`  | `/api/admin/users` | List all users |

Interactive docs: **http://localhost:8000/api/docs**

---

## 👤 Default Admin Account

After running `python seed.py`:

- **Email:** `admin@resumeanalyzer.com`  
- **Password:** `Admin@123456`  
- ⚠️ Change this password immediately after first login!

---

## 🏗️ Development Commands

```bash
# Backend: run with auto-reload
uvicorn app.main:app --reload

# Backend: create new migration
alembic revision --autogenerate -m "description"

# Backend: apply migrations
alembic upgrade head

# Backend: rollback one migration
alembic downgrade -1

# Frontend: dev server
npm run dev

# Frontend: production build
npm run build

# Frontend: preview production build
npm run preview
```

---

## 🔒 Security Notes

- Never commit `.env` files to version control
- Change the default `SECRET_KEY` in production
- Change the admin password after first login
- The `ANTHROPIC_API_KEY` is only used server-side — never exposed to the frontend
- File uploads are validated by extension and size (max 10MB)
- All routes except `/auth/*` require a valid JWT

---

## 📝 License

MIT
