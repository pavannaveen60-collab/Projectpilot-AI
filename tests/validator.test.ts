import { describe, it, expect } from 'vitest';
import { validateStudentProfile, validateProjectProposal, sanitizeString } from '../src/utils/validator';

describe('Validation Utility', () => {
  describe('sanitizeString', () => {
    it('strips script tags and malicious HTML injections', () => {
      const malicious = '<script>alert("pwned")</script>Hello World!';
      const clean = sanitizeString(malicious);
      expect(clean).toBe('Hello World!');
    });

    it('strips javascript: pseudo-protocols', () => {
      const input = 'javascript:doEvil() Safe Text';
      const clean = sanitizeString(input);
      expect(clean).not.toContain('javascript:');
    });

    it('handles empty and whitespace strings safely', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });
  });

  describe('validateStudentProfile', () => {
    it('validates a complete student profile', () => {
      const validProfile = {
        name: 'Alex Rivera',
        email: 'alex.rivera@university.edu',
        degree: 'B.Tech Computer Science',
        academicYear: 'Final Year (4th Year)' as const,
        technicalSkills: ['TypeScript', 'React', 'Node.js'],
        primaryInterests: ['AI', 'Cloud Computing'],
        careerGoal: 'Cloud Architect',
        availableDuration: '6 Months',
        teamSize: 'Solo (1 Student)' as const,
      };

      const result = validateStudentProfile(validProfile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('flags missing name and invalid email format', () => {
      const invalidProfile = {
        name: '   ',
        email: 'not-an-email',
        degree: '',
        technicalSkills: [],
      };

      const result = validateStudentProfile(invalidProfile);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeTruthy();
      expect(result.errors.email).toBeTruthy();
      expect(result.errors.degree).toBeTruthy();
      expect(result.errors.technicalSkills).toBeTruthy();
    });
  });

  describe('validateProjectProposal', () => {
    it('approves a well-formed project proposal', () => {
      const proposal = {
        title: 'Real-Time Edge Telemetry Platform',
        description: 'Collects and triages IoT sensor data with ML anomaly detection.',
        duration: '6 Months',
        teamSize: 'Solo',
      };

      const result = validateProjectProposal(proposal);
      expect(result.isValid).toBe(true);
    });

    it('rejects an empty title and too short description', () => {
      const invalidProposal = {
        title: '   ',
        description: 'short',
        duration: '',
        teamSize: '',
      };

      const result = validateProjectProposal(invalidProposal);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBeTruthy();
      expect(result.errors.description).toBeTruthy();
    });
  });
});
