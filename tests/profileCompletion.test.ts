import { describe, it, expect } from 'vitest';
import { calculateProfileCompletion } from '../src/utils/profileCompletion';
import { EMPTY_STUDENT_PROFILE, DEMO_STUDENT_PROFILE } from '../src/services/storage';
import { StudentProfile } from '../src/types';

describe('Profile Completion Calculation', () => {
  it('identifies an empty profile as incomplete and cannot generate ideas', () => {
    const result = calculateProfileCompletion(EMPTY_STUDENT_PROFILE);
    expect(result.canGenerateIdeas).toBe(false);
    expect(result.isMinimallyComplete).toBe(false);
    expect(result.percentage).toBeLessThan(30);
    expect(result.missingRequired).toContain('Full Name');
    expect(result.missingRequired).toContain('Degree');
    expect(result.missingRequired).toContain('Programming Languages or Technical Skills');
    expect(result.missingRequired).toContain('Career Goal');
  });

  it('allows generation for a fully populated student profile', () => {
    const studentProfile: StudentProfile = {
      name: 'Priya Sharma',
      degree: 'B.Tech / B.E.',
      branch: 'Computer Science & Engineering',
      year: 'Final Year (4th Year)',
      academicYear: 'Final Year (4th Year)',
      programmingLanguages: ['Python', 'SQL', 'C++'],
      technicalSkills: ['Machine Learning', 'REST APIs', 'Data Structures'],
      frameworks: ['FastAPI', 'React', 'PyTorch'],
      areasOfInterest: ['HealthTech & Clinical AI', 'Artificial Intelligence & GenAI'],
      interests: ['HealthTech & Clinical AI'],
      preferredDomains: ['Healthcare & Patient Care'],
      skillLevel: 'Intermediate',
      difficulty: 'Intermediate',
      duration: '3–6 months (Full Semester)',
      teamSize: 'Solo (1 Student)',
      careerGoal: 'AI / Machine Learning Engineer',
      preferredStack: ['Python + FastAPI + Gemini AI'],
    };

    const result = calculateProfileCompletion(studentProfile);
    expect(result.canGenerateIdeas).toBe(true);
    expect(result.isMinimallyComplete).toBe(true);
    expect(result.missingRequired.length).toBe(0);
    expect(result.percentage).toBe(100);
  });

  it('correctly tracks partial completion when optional fields are omitted', () => {
    const minimalProfile: Partial<StudentProfile> = {
      name: 'Liam Chen',
      degree: 'BCA',
      branch: 'Computer Applications',
      year: 'Final Year',
      programmingLanguages: ['JavaScript', 'Python'],
      interests: ['Web Development'],
      skillLevel: 'Intermediate',
      duration: '3–6 months',
      careerGoal: 'Frontend Developer',
      // Optional fields omitted: preferredDomains, frameworks, preferredStack, difficulty, teamSize
    };

    const result = calculateProfileCompletion(minimalProfile);
    expect(result.canGenerateIdeas).toBe(true);
    expect(result.isMinimallyComplete).toBe(true);
    expect(result.missingRequired.length).toBe(0);
    expect(result.missingOptional.length).toBeGreaterThan(0);
    expect(result.percentage).toBeGreaterThanOrEqual(75);
    expect(result.percentage).toBeLessThan(100);
  });

  it('flags an incomplete profile when critical required fields are absent', () => {
    const incompleteProfile: Partial<StudentProfile> = {
      name: 'Liam Chen',
      degree: 'BCA',
      // missing branch, year, skills, interests, duration, careerGoal
    };

    const result = calculateProfileCompletion(incompleteProfile);
    expect(result.canGenerateIdeas).toBe(false);
    expect(result.isMinimallyComplete).toBe(false);
    expect(result.missingRequired).toContain('Branch / Specialization');
    expect(result.missingRequired).toContain('Career Goal');
    expect(result.percentage).toBeLessThan(50);
  });

  it('verifies the demo profile is marked as complete and flagged as sample data', () => {
    const result = calculateProfileCompletion(DEMO_STUDENT_PROFILE);
    expect(result.canGenerateIdeas).toBe(true);
    expect(result.isMinimallyComplete).toBe(true);
    expect(DEMO_STUDENT_PROFILE.isDemoProfile).toBe(true);
  });
});
