import { describe, it, expect, beforeEach } from 'vitest';
import { getInitials, resolveDisplayName } from '../src/utils/user';
import { storageService } from '../src/services/storage';
import { authService } from '../src/services/auth';
import { StudentProfile } from '../src/types';

// Polyfill localStorage in test environment if not defined
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  } as unknown as Storage;
}

describe('User Identity & Initials Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getInitials', () => {
    it('generates PN for "PAVAN KUMAR N"', () => {
      expect(getInitials('PAVAN KUMAR N')).toBe('PN');
    });

    it('generates RS for "Rahul Sharma"', () => {
      expect(getInitials('Rahul Sharma')).toBe('RS');
    });

    it('generates P for single word name "Pavan"', () => {
      expect(getInitials('Pavan')).toBe('P');
    });

    it('generates PK for "Pavan Kumar"', () => {
      expect(getInitials('Pavan Kumar')).toBe('PK');
    });

    it('generates PN for "Pavan Kumar N"', () => {
      expect(getInitials('Pavan Kumar N')).toBe('PN');
    });

    it('handles empty string and undefined safely', () => {
      expect(getInitials('')).toBe('');
      expect(getInitials(null)).toBe('');
      expect(getInitials(undefined)).toBe('');
    });

    it('handles extra whitespaces properly', () => {
      expect(getInitials('  PAVAN    KUMAR   N  ')).toBe('PN');
    });
  });

  describe('resolveDisplayName', () => {
    it('prioritizes student profile name over auth displayName', () => {
      const name = resolveDisplayName('PAVAN KUMAR N', undefined, 'Old Name', 'user@uni.edu');
      expect(name).toBe('PAVAN KUMAR N');
    });

    it('falls back to auth displayName when profile name is empty', () => {
      const name = resolveDisplayName('', '', 'Rahul Sharma', 'user@uni.edu');
      expect(name).toBe('Rahul Sharma');
    });

    it('falls back to formatted email username when profile and auth names are empty', () => {
      const name = resolveDisplayName('', '', '', 'pavan.kumar@uni.edu');
      expect(name).toBe('Pavan Kumar');
    });

    it('rejects hardcoded Alex Morgan from leaking through', () => {
      const name = resolveDisplayName('Alex Morgan', undefined, 'Alex Morgan', 'student@uni.edu');
      expect(name).toBe('Student');
    });
  });

  describe('Identity Persistence and Synchronization', () => {
    it('stores profile under users/{uid} key and sanitizes name', () => {
      const uid = 'test_student_123';
      const sampleProfile: StudentProfile = {
        userId: uid,
        uid: uid,
        name: 'PAVAN KUMAR N',
        fullName: 'PAVAN KUMAR N',
        degree: 'B.Tech',
        branch: 'Computer Science',
        year: '4th Year',
        academicYear: '4th Year',
        programmingLanguages: ['TypeScript'],
        technicalSkills: ['React'],
        frameworks: ['Vite'],
        interests: ['AI'],
        areasOfInterest: ['AI'],
        preferredDomains: ['Education'],
        preferredDomain: 'Education',
        skillLevel: 'Advanced',
        difficulty: 'Advanced',
        duration: '6 months',
        teamSize: 'Solo',
        careerGoal: 'AI Engineer',
        preferredStack: ['React + Node.js'],
      };

      storageService.saveProfile(uid, sampleProfile);

      // Verify written to users/{uid}
      const rawStored = localStorage.getItem(`users/${uid}`);
      expect(rawStored).toBeTruthy();
      const parsed = JSON.parse(rawStored!);
      expect(parsed.name).toBe('PAVAN KUMAR N');
      expect(parsed.uid).toBe(uid);

      // Verify retrieval returns correct profile and initials
      const loaded = storageService.getProfile(uid);
      expect(loaded.name).toBe('PAVAN KUMAR N');
      expect(getInitials(loaded.name)).toBe('PN');
    });

    it('updates identity dynamically when name changes from PAVAN KUMAR N to Rahul Sharma', () => {
      const uid = 'user_pavan_456';
      const initialProfile: StudentProfile = {
        userId: uid,
        uid: uid,
        name: 'PAVAN KUMAR N',
        fullName: 'PAVAN KUMAR N',
        degree: 'B.Tech',
        branch: 'Computer Science',
        year: 'Final Year',
        academicYear: 'Final Year',
        programmingLanguages: ['Python'],
        technicalSkills: ['Machine Learning'],
        frameworks: ['PyTorch'],
        interests: ['GenAI'],
        preferredDomains: ['Healthcare'],
        skillLevel: 'Intermediate',
        difficulty: 'Intermediate',
        duration: '4 months',
        teamSize: 'Solo',
        careerGoal: 'ML Engineer',
        preferredStack: ['Python + FastAPI'],
      };

      // Step 1: Save initial profile
      storageService.saveProfile(uid, initialProfile);
      let loaded = storageService.getProfile(uid);
      expect(loaded.name).toBe('PAVAN KUMAR N');
      expect(getInitials(loaded.name)).toBe('PN');

      // Step 2: Change name to Rahul Sharma
      const updatedProfile = {
        ...loaded,
        name: 'Rahul Sharma',
        fullName: 'Rahul Sharma',
      };
      storageService.saveProfile(uid, updatedProfile);

      loaded = storageService.getProfile(uid);
      expect(loaded.name).toBe('Rahul Sharma');
      expect(getInitials(loaded.name)).toBe('RS');

      // Step 3: Change name to Pavan Kumar
      const thirdProfile = {
        ...loaded,
        name: 'Pavan Kumar',
        fullName: 'Pavan Kumar',
      };
      storageService.saveProfile(uid, thirdProfile);

      loaded = storageService.getProfile(uid);
      expect(loaded.name).toBe('Pavan Kumar');
      expect(getInitials(loaded.name)).toBe('PK');
    });

    it('authService.updateDisplayName updates current user display name', async () => {
      const res = await authService.login('pavan@university.edu', 'password123');
      expect(res.user).toBeDefined();
      expect(res.user?.displayName).not.toBe('Alex Morgan');

      authService.updateDisplayName('Rahul Sharma');
      const currentUser = authService.getCurrentUser();
      expect(currentUser?.displayName).toBe('Rahul Sharma');
      expect(getInitials(currentUser?.displayName)).toBe('RS');
    });
  });
});
