from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

    @validator("password")
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @validator("name")
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ── User ──────────────────────────────────────────────
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    is_active: bool
    avatar_url: Optional[str]
    bio: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


# ── Resume ────────────────────────────────────────────
class ResumeResponse(BaseModel):
    id: int
    user_id: int
    original_filename: str
    file_type: str
    file_size: Optional[int]
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ── Analysis ──────────────────────────────────────────
class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    ats_score: Optional[float]
    keyword_score: Optional[float]
    readability_score: Optional[float]
    formatting_score: Optional[float]
    overall_score: Optional[float]
    skills: Optional[List[str]]
    experience: Optional[List[Dict]]
    education: Optional[List[Dict]]
    certifications: Optional[List[str]]
    projects: Optional[List[Dict]]
    existing_keywords: Optional[List[str]]
    missing_keywords: Optional[List[str]]
    keyword_density: Optional[Dict]
    strengths: Optional[List[str]]
    weaknesses: Optional[List[str]]
    recommendations: Optional[List[str]]
    summary: Optional[str]
    created_at: datetime
    resume: Optional[ResumeResponse]

    class Config:
        from_attributes = True


# ── Job Match ─────────────────────────────────────────
class JobMatchRequest(BaseModel):
    analysis_id: int
    job_title: str
    job_description: str


class JobMatchResponse(BaseModel):
    id: int
    analysis_id: int
    job_title: str
    match_score: Optional[float]
    missing_keywords: Optional[List[str]]
    missing_skills: Optional[List[str]]
    matching_skills: Optional[List[str]]
    suggestions: Optional[List[str]]
    summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Admin ─────────────────────────────────────────────
class AdminStats(BaseModel):
    total_users: int
    total_resumes: int
    total_analyses: int
    avg_ats_score: float
    popular_skills: List[Dict]
    recent_analyses: List[Dict]
    analyses_per_day: List[Dict]


Token.model_rebuild()
