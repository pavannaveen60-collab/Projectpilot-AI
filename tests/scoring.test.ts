import { describe, it, expect } from 'vitest';
import { calculateProjectFit } from '../src/utils/scoring';
import { StudentProfile, ProjectIdea } from '../src/types';

describe('Scoring Utility - calculateProjectFit', () => {
  const sampleProfile: StudentProfile = {
    id: 'user_123',
    name: 'Jane Doe',
    email: 'jane@college.edu',
    academicYear: 'Final Year (Semester 8)' as const,
    degree: 'B.Tech in Computer Science',
    technicalSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    primaryInterests: ['Healthcare', 'Full Stack Development'],
    difficultyLevel: 'Intermediate',
    preferredProjectTypes: ['Full Stack Web Application'],
    targetIndustry: 'HealthTech & Telemedicine',
    careerGoal: 'Full Stack Software Engineer',
    availableDuration: '6 Months',
    teamSize: 'Solo (1 Student)',
    weeklyHours: 20,
    hasHardwareConstraints: false,
    hardwareConstraintDetails: '',
    wantsResearchFocus: false,
    updatedAt: new Date().toISOString(),
  };

  const sampleProject: ProjectIdea = {
    id: 'proj_sample',
    title: 'Distributed EHR Triage System',
    shortDescription: 'Modern electronic health record and patient triage web app.',
    problemStatement: 'Hospitals lack automated priority triage and unified record exchange.',
    targetUsers: ['Clinicians', 'Triage Nurses', 'Patients'],
    realWorldUseCase: 'Triages patient severity queues during intake emergencies.',
    coreFeatures: ['FHIR sync', 'Priority triage model', 'Clinician dashboard'],
    recommendedTechStack: {
      frontend: ['React', 'TypeScript'],
      backend: ['Node.js', 'Express'],
      database: ['PostgreSQL'],
      aiOrMl: ['Gemini Flash'],
      cloudOrDevOps: ['Docker', 'Cloud Run'],
    },
    aiComponent: 'Severity symptom NLP classifier',
    requiredSkills: ['React', 'Node.js', 'TypeScript'],
    skillsToLearn: ['FHIR HL7 standard', 'Healthcare compliance'],
    estimatedDuration: '6 Months',
    difficulty: 'Intermediate',
    innovationFactor: 'Real-time FHIR interoperability',
    careerRelevance: 'Directly applicable to health-tech engineering roles',
    potentialChallenges: ['HIPAA/GDPR compliance', 'High availability'],
    futureScope: ['Native mobile client', 'Wearables integration'],
  };

  it('calculates deterministic scores bounded between 0 and 100', () => {
    const result = calculateProjectFit(sampleProfile, sampleProject);

    expect(result.skillMatch).toBeGreaterThanOrEqual(0);
    expect(result.skillMatch).toBeLessThanOrEqual(100);

    expect(result.feasibility).toBeGreaterThanOrEqual(0);
    expect(result.feasibility).toBeLessThanOrEqual(100);

    expect(result.innovation).toBeGreaterThanOrEqual(0);
    expect(result.innovation).toBeLessThanOrEqual(100);

    expect(result.careerRelevance).toBeGreaterThanOrEqual(0);
    expect(result.careerRelevance).toBeLessThanOrEqual(100);

    expect(result.timeSuitability).toBeGreaterThanOrEqual(0);
    expect(result.timeSuitability).toBeLessThanOrEqual(100);

    expect(result.overallFit).toBeGreaterThanOrEqual(0);
    expect(result.overallFit).toBeLessThanOrEqual(100);
  });

  it('rewards full skill overlap with high skillMatch score', () => {
    const highSkillResult = calculateProjectFit(sampleProfile, sampleProject);
    expect(highSkillResult.skillMatch).toBeGreaterThanOrEqual(80);
    expect(highSkillResult.explanation.skillMatch).toContain('match');
  });

  it('adjusts skillMatch downwards when student lacks required skills', () => {
    const lowSkillProfile: StudentProfile = {
      ...sampleProfile,
      technicalSkills: ['Ruby', 'PHP'],
    };

    const lowSkillResult = calculateProjectFit(lowSkillProfile, sampleProject);
    expect(lowSkillResult.skillMatch).toBeLessThan(highSkillScore(sampleProfile, sampleProject));
  });

  it('generates rich, transparent textual explanations for each criterion', () => {
    const result = calculateProjectFit(sampleProfile, sampleProject);
    expect(result.explanation.skillMatch).toBeTruthy();
    expect(result.explanation.feasibility).toBeTruthy();
    expect(result.explanation.innovation).toBeTruthy();
    expect(result.explanation.careerRelevance).toBeTruthy();
    expect(result.explanation.timeSuitability).toBeTruthy();
    expect(result.explanation.overallSummary).toBeTruthy();
  });
});

function highSkillScore(profile: StudentProfile, project: ProjectIdea): number {
  return calculateProjectFit(profile, project).skillMatch;
}
