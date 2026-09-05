import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../src/services/api';
import { StudentProfile, ProjectIdea } from '../src/types';
import { EMPTY_STUDENT_PROFILE } from '../src/services/storage';

describe('Google Gemini Integration & Error Handling Tests', () => {
  const completeProfile: StudentProfile = {
    ...EMPTY_STUDENT_PROFILE,
    name: 'Devin Thorne',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year: 'Final Year (4th Year)',
    academicYear: 'Final Year (4th Year)',
    programmingLanguages: ['TypeScript', 'Python'],
    technicalSkills: ['React', 'Express', 'Cloud Firestore', 'Docker'],
    careerGoal: 'Full-Stack Cloud Engineer',
    teamSize: 'Solo (1 Student)',
    duration: '6 Months',
  };

  const sampleProject: ProjectIdea = {
    id: 'proj_cloud_sentinel',
    title: 'CloudSentinel AI',
    shortDescription: 'Autonomous cloud security posture management.',
    problemStatement: 'Cloud configurations suffer from silent permission drift and misconfigurations.',
    targetUsers: ['DevOps Engineers', 'Security Auditors'],
    realWorldUseCase: 'Scans cloud infrastructure for privilege escalation vulnerabilities.',
    coreFeatures: ['IAM drift detector', 'Remediation generator', 'Audit dashboard'],
    recommendedTechStack: {
      frontend: ['React', 'Tailwind'],
      backend: ['Node.js', 'Express'],
      database: ['Cloud Firestore'],
      aiOrMl: ['Google Gemini 3.8 Flash'],
      cloudOrDevOps: ['Docker', 'Cloud Run'],
    },
    aiComponent: 'Gemini reasoning agent analyzing IAM policy graphs for toxic combinations.',
    requiredSkills: ['React', 'TypeScript', 'Docker'],
    skillsToLearn: ['Cloud Security', 'Zero-Trust'],
    estimatedDuration: '6 Months',
    difficulty: 'Intermediate',
    innovationFactor: 'Graph-based semantic IAM policy verification',
    careerRelevance: 'Directly applicable to Cloud Engineering roles',
    potentialChallenges: ['Complex multi-cloud IAM permissions'],
    futureScope: ['Kubernetes RBAC validation'],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects project generation if student profile is incomplete', async () => {
    // Incomplete profile missing name and career goal
    const incompleteProfile: StudentProfile = {
      ...EMPTY_STUDENT_PROFILE,
      name: '',
      degree: 'B.Tech',
      technicalSkills: [],
      careerGoal: '',
    };

    // Simulate backend validation rejection
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Incomplete student profile. Please complete your profile with your name, degree/branch, skills, and career goal before generating projects.',
      }),
    } as unknown as Response);

    const res = await apiService.generateProjects(incompleteProfile);
    expect(res.error).toContain('Incomplete student profile');
    expect(res.data).toBeUndefined();
  });

  it('returns clean error status when Google Gemini API service is unavailable (no silent fakes)', async () => {
    // Simulate server returning 503 when GEMINI_API_KEY is unconfigured or rate limited
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        error: 'Google Gemini AI service is currently unavailable. Please verify that GEMINI_API_KEY is configured in your server environment.',
      }),
    } as unknown as Response);

    const res = await apiService.generateProjects(completeProfile);
    expect(res.error).toContain('Google Gemini AI service is currently unavailable');
    expect(res.data).toBeUndefined();
  });

  it('handles blueprint generation failure with explicit error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Failed to generate technical blueprint via Google Gemini: Quota exceeded.',
      }),
    } as unknown as Response);

    const res = await apiService.generateBlueprint(sampleProject, completeProfile);
    expect(res.error).toContain('Failed to generate technical blueprint via Google Gemini');
    expect(res.data).toBeUndefined();
  });

  it('handles fit analysis live Gemini invocation with structured scoring schema', async () => {
    const mockFitScores = {
      skillMatch: 95,
      feasibility: 90,
      innovation: 92,
      careerRelevance: 96,
      timeSuitability: 91,
      overallFit: 93,
      explanation: {
        skillMatch: 'Strong alignment with TypeScript and React background.',
        feasibility: 'Clean architectural boundary achievable in 6 months.',
        innovation: 'Novel graph reasoning approach to cloud posture analysis.',
        careerRelevance: 'Directly targets Full-Stack Cloud Engineer profile.',
        timeSuitability: 'Phased sprint milestones fit academic year schedule.',
        overallSummary: 'High impact final-year capstone with rigorous engineering depth.',
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        fitScores: mockFitScores,
        cached: false,
      }),
    } as unknown as Response);

    const res = await apiService.analyzeFit(sampleProject, completeProfile);
    expect(res.error).toBeUndefined();
    expect(res.data?.fitScores.overallFit).toBe(93);
    expect(res.data?.fitScores.skillMatch).toBe(95);
    expect(res.data?.fitScores.explanation.overallSummary).toContain('High impact');
  });

  it('attaches Bearer token in request headers for authenticated Gemini calls', async () => {
    let capturedHeaders: HeadersInit | undefined;

    globalThis.fetch = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ reply: 'I recommend starting with Phase 1 architecture setup.' }),
      } as Response);
    });

    await apiService.sendMentorMessage('What should I build next?', [], {
      project: sampleProject,
      profile: completeProfile,
    });

    expect(capturedHeaders).toBeDefined();
    const headersObj = capturedHeaders as Record<string, string>;
    expect(headersObj['Content-Type']).toBe('application/json');
  });
});
