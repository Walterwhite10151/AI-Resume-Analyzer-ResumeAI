from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import Analysis, JobMatch
from app.schemas.schemas import AnalysisResponse, JobMatchRequest, JobMatchResponse
from app.services import ai_service

router = APIRouter()


@router.post("/analyze/{resume_id}", response_model=AnalysisResponse, status_code=201)
async def analyze_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if not resume.extracted_text or len(resume.extracted_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract enough text from resume. Please ensure the file is not scanned/image-based.",
        )

    # Run AI analysis
    try:
        ai_result = ai_service.analyze_resume(resume.extracted_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    # Save analysis
    analysis = Analysis(
        resume_id=resume.id,
        ats_score=ai_result.get("ats_score"),
        keyword_score=ai_result.get("keyword_score"),
        readability_score=ai_result.get("readability_score"),
        formatting_score=ai_result.get("formatting_score"),
        overall_score=ai_result.get("overall_score"),
        skills=ai_result.get("skills", []),
        experience=ai_result.get("experience", []),
        education=ai_result.get("education", []),
        certifications=ai_result.get("certifications", []),
        projects=ai_result.get("projects", []),
        existing_keywords=ai_result.get("existing_keywords", []),
        missing_keywords=ai_result.get("missing_keywords", []),
        keyword_density=ai_result.get("keyword_density", {}),
        strengths=ai_result.get("strengths", []),
        weaknesses=ai_result.get("weaknesses", []),
        recommendations=ai_result.get("recommendations", []),
        summary=ai_result.get("summary", ""),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # Eager-load resume relationship
    analysis.resume = resume
    return analysis


@router.post("/job-match", response_model=JobMatchResponse, status_code=201)
async def job_match(
    data: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .join(Resume)
        .filter(Analysis.id == data.analysis_id, Resume.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    if not resume or not resume.extracted_text:
        raise HTTPException(status_code=400, detail="Resume text not available")

    try:
        result = ai_service.job_match_analysis(
            resume.extracted_text,
            data.job_title,
            data.job_description,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job match analysis failed: {str(e)}")

    job_match_record = JobMatch(
        analysis_id=analysis.id,
        job_title=data.job_title,
        job_description=data.job_description,
        match_score=result.get("match_score"),
        missing_keywords=result.get("missing_keywords", []),
        missing_skills=result.get("missing_skills", []),
        matching_skills=result.get("matching_skills", []),
        suggestions=result.get("suggestions", []),
        summary=result.get("summary", ""),
    )
    db.add(job_match_record)
    db.commit()
    db.refresh(job_match_record)
    return job_match_record


@router.get("/history", response_model=list[AnalysisResponse])
async def get_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analyses = (
        db.query(Analysis)
        .join(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    # Attach resume objects
    for a in analyses:
        _ = a.resume
    return analyses


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .join(Resume)
        .filter(Analysis.id == analysis_id, Resume.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    _ = analysis.resume
    return analysis


@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .join(Resume)
        .filter(Analysis.id == analysis_id, Resume.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(analysis)
    db.commit()
    return {"message": "Analysis deleted"}


@router.get("/{analysis_id}/job-matches", response_model=list[JobMatchResponse])
async def get_job_matches(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .join(Resume)
        .filter(Analysis.id == analysis_id, Resume.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis.job_matches
