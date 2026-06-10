export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  is_active: boolean
  avatar_url?: string
  bio?: string
  created_at: string
}

export interface Resume {
  id: number
  user_id: number
  original_filename: string
  file_type: string
  file_size?: number
  uploaded_at: string
}

export interface Analysis {
  id: number
  resume_id: number
  ats_score?: number
  keyword_score?: number
  readability_score?: number
  formatting_score?: number
  overall_score?: number
  skills?: string[]
  experience?: ExperienceItem[]
  education?: EducationItem[]
  certifications?: string[]
  projects?: ProjectItem[]
  existing_keywords?: string[]
  missing_keywords?: string[]
  keyword_density?: KeywordDensity
  strengths?: string[]
  weaknesses?: string[]
  recommendations?: string[]
  summary?: string
  created_at: string
  resume?: Resume
}

export interface ExperienceItem {
  title: string
  company: string
  duration: string
  description?: string
}

export interface EducationItem {
  degree: string
  institution: string
  year?: string
  field?: string
}

export interface ProjectItem {
  name: string
  description?: string
  technologies?: string[]
}

export interface KeywordDensity {
  technical?: number
  soft_skills?: number
  action_verbs?: number
}

export interface JobMatch {
  id: number
  analysis_id: number
  job_title: string
  match_score?: number
  missing_keywords?: string[]
  missing_skills?: string[]
  matching_skills?: string[]
  suggestions?: string[]
  summary?: string
  created_at: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  user: User
}

export interface AdminStats {
  total_users: number
  total_resumes: number
  total_analyses: number
  avg_ats_score: number
  popular_skills: { skill: string; count: number }[]
  recent_analyses: {
    id: number
    user_name: string
    filename: string
    ats_score: number
    created_at: string
  }[]
  analyses_per_day: { date: string; count: number }[]
}
