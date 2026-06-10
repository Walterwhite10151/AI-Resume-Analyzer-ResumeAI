from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)

    # Scores
    ats_score = Column(Float, nullable=True)
    keyword_score = Column(Float, nullable=True)
    readability_score = Column(Float, nullable=True)
    formatting_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)

    # Extracted data (JSON)
    skills = Column(JSON, nullable=True)
    experience = Column(JSON, nullable=True)
    education = Column(JSON, nullable=True)
    certifications = Column(JSON, nullable=True)
    projects = Column(JSON, nullable=True)

    # Keywords
    existing_keywords = Column(JSON, nullable=True)
    missing_keywords = Column(JSON, nullable=True)
    keyword_density = Column(JSON, nullable=True)

    # AI Feedback
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)

    # Summary
    summary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resume = relationship("Resume", back_populates="analyses")
    job_matches = relationship("JobMatch", back_populates="analysis", cascade="all, delete-orphan")


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)

    job_title = Column(String(500), nullable=False)
    job_description = Column(Text, nullable=True)
    match_score = Column(Float, nullable=True)
    missing_keywords = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    matching_skills = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    analysis = relationship("Analysis", back_populates="job_matches")
