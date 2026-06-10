from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from collections import Counter

from app.database.session import get_db
from app.core.security import get_current_admin
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import Analysis
from app.schemas.schemas import AdminStats

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
async def get_stats(
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_resumes = db.query(func.count(Resume.id)).scalar() or 0
    total_analyses = db.query(func.count(Analysis.id)).scalar() or 0
    avg_ats = db.query(func.avg(Analysis.ats_score)).scalar() or 0.0

    # Popular skills: collect from all analyses
    all_analyses = db.query(Analysis.skills).filter(Analysis.skills.isnot(None)).limit(500).all()
    skill_counter = Counter()
    for (skills,) in all_analyses:
        if isinstance(skills, list):
            for s in skills:
                skill_counter[str(s)] += 1

    popular_skills = [{"skill": k, "count": v} for k, v in skill_counter.most_common(10)]

    # Recent analyses
    recent = (
        db.query(Analysis, Resume, User)
        .join(Resume, Analysis.resume_id == Resume.id)
        .join(User, Resume.user_id == User.id)
        .order_by(desc(Analysis.created_at))
        .limit(10)
        .all()
    )
    recent_analyses = [
        {
            "id": a.id,
            "user_name": u.name,
            "filename": r.original_filename,
            "ats_score": a.ats_score,
            "created_at": str(a.created_at),
        }
        for a, r, u in recent
    ]

    # Analyses per day (last 7 days)
    daily = (
        db.query(
            func.date(Analysis.created_at).label("date"),
            func.count(Analysis.id).label("count"),
        )
        .group_by(func.date(Analysis.created_at))
        .order_by(func.date(Analysis.created_at).desc())
        .limit(7)
        .all()
    )
    analyses_per_day = [{"date": str(d.date), "count": d.count} for d in reversed(daily)]

    return AdminStats(
        total_users=total_users,
        total_resumes=total_resumes,
        total_analyses=total_analyses,
        avg_ats_score=round(float(avg_ats), 1),
        popular_skills=popular_skills,
        recent_analyses=recent_analyses,
        analyses_per_day=analyses_per_day,
    )


@router.get("/users")
async def list_users(
    skip: int = 0,
    limit: int = 50,
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "created_at": str(u.created_at),
            "resume_count": len(u.resumes),
        }
        for u in users
    ]
