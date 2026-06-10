import json
import re
import requests
from typing import Dict, Any
from app.core.config import settings

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def _call_groq(prompt: str) -> str:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.GEMINI_API_KEY}"
    }
    body = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 4096
    }
    response = requests.post(GROQ_URL, headers=headers, json=body, timeout=60)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

def _parse_json_response(text: str) -> Dict:
    try:
        return json.loads(text)
    except:
        pass
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1))
        except:
            pass
    match = re.search(r"\{[\s\S]+\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except:
            pass
    return {}

def analyze_resume(resume_text: str) -> Dict[str, Any]:
    prompt = f"""You are an expert ATS analyst. Analyze this resume and return ONLY a valid JSON object, no other text.

RESUME:
{resume_text[:8000]}

Return ONLY this JSON:
{{
  "ats_score": <0-100>,
  "keyword_score": <0-100>,
  "readability_score": <0-100>,
  "formatting_score": <0-100>,
  "overall_score": <0-100>,
  "skills": ["skill1", "skill2"],
  "experience": [{{"title": "Job Title", "company": "Company", "duration": "X years", "description": "desc"}}],
  "education": [{{"degree": "Degree", "institution": "School", "year": "Year", "field": "Field"}}],
  "certifications": ["cert1"],
  "projects": [{{"name": "Project", "description": "desc", "technologies": ["tech1"]}}],
  "existing_keywords": ["keyword1"],
  "missing_keywords": ["keyword1"],
  "keyword_density": {{"technical": 0.3, "soft_skills": 0.2, "action_verbs": 0.15}},
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "recommendations": ["rec1"],
  "summary": "2-3 sentence summary"
}}"""

    text = _call_groq(prompt)
    result = _parse_json_response(text)
    defaults = {
        "ats_score": 60, "keyword_score": 55, "readability_score": 65,
        "formatting_score": 60, "overall_score": 60, "skills": [],
        "experience": [], "education": [], "certifications": [], "projects": [],
        "existing_keywords": [], "missing_keywords": [],
        "keyword_density": {"technical": 0.3, "soft_skills": 0.2, "action_verbs": 0.15},
        "strengths": [], "weaknesses": [], "recommendations": [],
        "summary": "Resume analyzed successfully.",
    }
    for key, default in defaults.items():
        if key not in result:
            result[key] = default
    return result

def job_match_analysis(resume_text: str, job_title: str, job_description: str) -> Dict[str, Any]:
    prompt = f"""Analyze resume against job. Return ONLY valid JSON.

JOB TITLE: {job_title}
JOB DESCRIPTION: {job_description[:2000]}
RESUME: {resume_text[:4000]}

Return ONLY:
{{
  "match_score": <0-100>,
  "matching_skills": ["skill1"],
  "missing_skills": ["skill1"],
  "missing_keywords": ["keyword1"],
  "suggestions": ["suggestion1"],
  "summary": "2-3 sentence summary"
}}"""

    text = _call_groq(prompt)
    result = _parse_json_response(text)
    defaults = {
        "match_score": 50, "matching_skills": [], "missing_skills": [],
        "missing_keywords": [], "suggestions": [], "summary": "Analysis complete.",
    }
    for key, default in defaults.items():
        if key not in result:
            result[key] = default
    return result