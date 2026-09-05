import {
  StudentProfile,
  ProjectIdea,
  ProjectBlueprint,
  ProjectRoadmap,
  MentorMessage,
  ProjectImprovementAnalysis,
  FeasibilityValidationResult,
  ProjectFitScores,
} from '../types';
import { authService } from './auth';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  cached?: boolean;
  fallback?: boolean;
}

const REQUEST_TIMEOUT_MS = 25000;

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const session = authService.getCurrentUser();
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }
    if (session?.uid || session?.userId) {
      headers['X-User-Id'] = session.uid || session.userId || '';
    }
  } catch {
    // ignore
  }
  return headers;
}

async function postJson<T>(endpoint: string, payload: unknown): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      return {
        error: errData.error || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { error: 'Request timed out. The server took too long to respond.' };
    }
    return { error: err.message || 'A network error occurred. Please check your connection.' };
  }
}

export const apiService = {
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline', hasGeminiKey: false };
    }
  },

  async getUserProfile(userId: string): Promise<ApiResponse<{ profile: StudentProfile }>> {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}/profile`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        if (res.status === 404) {
          return { error: 'Profile not found' };
        }
        return { error: `Failed to fetch profile: HTTP ${res.status}` };
      }
      const data = await res.json();
      return { data };
    } catch (err: any) {
      return { error: err.message || 'Network error fetching profile' };
    }
  },

  async saveUserProfile(userId: string, profile: StudentProfile): Promise<ApiResponse<{ profile: StudentProfile; saved: boolean }>> {
    const res = await postJson<{ profile: StudentProfile; saved: boolean }>(
      `/api/users/${encodeURIComponent(userId)}/profile`,
      { profile }
    );
    if (res.error) return { error: res.error };
    return { data: res.data };
  },

  async generateProjects(profile: StudentProfile): Promise<ApiResponse<{ projects: ProjectIdea[]; cached?: boolean; fallback?: boolean }>> {
    const res = await postJson<{ projects: ProjectIdea[]; cached?: boolean; fallback?: boolean }>(
      '/api/gemini/generate-projects',
      { profile }
    );
    if (res.error) return { error: res.error };
    return { data: res.data };
  },

  async generateBlueprint(project: ProjectIdea, profile?: StudentProfile): Promise<ApiResponse<{ blueprint: ProjectBlueprint; cached?: boolean }>> {
    const res = await postJson<{ blueprint: ProjectBlueprint; cached?: boolean }>(
      '/api/gemini/generate-blueprint',
      { project, profile }
    );
    if (res.error) return { error: res.error };
    return { data: res.data };
  },

  async generateRoadmap(project: ProjectIdea, profile?: StudentProfile): Promise<ApiResponse<{ roadmap: ProjectRoadmap; cached?: boolean }>> {
    const res = await postJson<{ roadmap: ProjectRoadmap; cached?: boolean }>(
      '/api/gemini/generate-roadmap',
      { project, profile }
    );
    if (res.error) return { error: res.error };
    return { data: res.data };
  },

  async sendMentorMessage(
    message: string,
    history: MentorMessage[],
    context: {
      project: ProjectIdea | null;
      profile: StudentProfile | null;
      currentPhaseTitle?: string;
      completedTaskTitles?: string[];
      nextTaskTitle?: string;
    }
  ): Promise<ApiResponse<{ reply: string }>> {
    const res = await postJson<{ reply: string }>(
      '/api/gemini/mentor-chat',
      { message, history, context }
    );
    if (res.error) return { error: res.error };
    return { data: res.data };
  },

  async improveProject(
    idea: string,
    domain?: string,
    skills?: string
  ): Promise<ApiResponse<{ analysis: ProjectImprovementAnalysis }>> {
    const res = await postJson<{ analysis: ProjectImprovementAnalysis }>(
      '/api/gemini/improve-project',
      { idea, domain, skills }
    );
    if (res.error) return { error: res.error };
    return { data: res.data };
  },

  async validateFeasibility(payload: {
    title: string;
    description: string;
    features: string[];
    duration?: string;
    teamSize?: string;
    studentSkills?: string;
  }): Promise<ApiResponse<{ validation: FeasibilityValidationResult }>> {
    const res = await postJson<{ validation: FeasibilityValidationResult }>(
      '/api/gemini/validate-feasibility',
      payload
    );
    if (res.error) return { error: res.error };
    return { data: res.data };
  },

  async analyzeFit(
    project: ProjectIdea,
    profile: StudentProfile
  ): Promise<ApiResponse<{ fitScores: ProjectFitScores; cached?: boolean }>> {
    const res = await postJson<{ fitScores: ProjectFitScores; cached?: boolean }>(
      '/api/gemini/analyze-fit',
      { project, profile }
    );
    if (res.error) return { error: res.error };
    return { data: res.data };
  },
};
