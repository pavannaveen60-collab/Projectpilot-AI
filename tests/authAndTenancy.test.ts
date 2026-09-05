import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../src/services/auth';
import { storageService, EMPTY_STUDENT_PROFILE } from '../src/services/storage';
import { StudentProfile } from '../src/types';

// Polyfill localStorage in test environment
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

describe('Authentication & Tenancy Security Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('registers a new student and generates secure session token', async () => {
    const res = await authService.register('Priya Sharma', 'priya.sharma@college.edu', 'SecurePass123!');
    expect(res.user).toBeTruthy();
    expect(res.user?.email).toBe('priya.sharma@college.edu');
    expect(res.user?.displayName).toBe('Priya Sharma');
    expect(res.user?.token).toMatch(/^tok_/);
    expect(res.user?.uid).toMatch(/^usr_/);
    expect(res.user?.isDemo).toBe(false);

    // Verify session persisted
    const current = authService.getCurrentUser();
    expect(current?.uid).toBe(res.user?.uid);
  });

  it('rejects invalid email and weak password during registration', async () => {
    const invalidEmailRes = await authService.register('Priya Sharma', 'invalid-email', 'ValidPassword123');
    expect(invalidEmailRes.error).toContain('valid academic email');

    const shortPassRes = await authService.register('Priya Sharma', 'priya@college.edu', '123');
    expect(shortPassRes.error).toContain('at least 6 characters');
  });

  it('isolates demo evaluator session with explicit isDemo flag', async () => {
    const demo = await authService.loginAsDemoStudent();
    expect(demo.isDemo).toBe(true);
    expect(demo.uid).toBe('usr_demo_evaluator');
    expect(demo.email).toBe('evaluator.demo@university.edu');
    expect(demo.displayName).toBe('Demo Evaluator');
  });

  it('clears session on logout', async () => {
    await authService.login('student@college.edu');
    expect(authService.getCurrentUser()).toBeTruthy();

    await authService.logout();
    expect(authService.getCurrentUser()).toBeNull();
  });

  it('strictly maps student profile to users/{uid} as single source of truth', () => {
    const uid = 'usr_student_alpha';
    const profile: StudentProfile = {
      ...EMPTY_STUDENT_PROFILE,
      userId: uid,
      uid: uid,
      name: 'Ananya Roy',
      degree: 'B.Tech',
      branch: 'Artificial Intelligence',
      year: 'Final Year',
      academicYear: 'Final Year',
      programmingLanguages: ['Python', 'SQL'],
      technicalSkills: ['PyTorch', 'Transformers', 'FastAPI'],
      careerGoal: 'AI Research Engineer',
      teamSize: 'Solo (1 Student)',
    };

    storageService.saveProfile(uid, profile);

    // Check direct Firestore key path
    const stored = localStorage.getItem(`users/${uid}`);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.name).toBe('Ananya Roy');
    expect(parsed.userId).toBe(uid);
    expect(parsed.uid).toBe(uid);

    // Retrieve via service
    const loaded = storageService.getProfile(uid);
    expect(loaded.name).toBe('Ananya Roy');
    expect(loaded.technicalSkills).toContain('PyTorch');
  });

  it('prevents cross-user data collision between different UIDs', () => {
    const userA = 'usr_alice_111';
    const userB = 'usr_bob_222';

    storageService.saveProfile(userA, {
      ...EMPTY_STUDENT_PROFILE,
      userId: userA,
      uid: userA,
      name: 'Alice Cooper',
      degree: 'B.Tech',
      academicYear: 'Final Year',
      technicalSkills: ['React', 'TypeScript'],
      careerGoal: 'Frontend Architect',
      teamSize: 'Solo (1 Student)',
    });

    storageService.saveProfile(userB, {
      ...EMPTY_STUDENT_PROFILE,
      userId: userB,
      uid: userB,
      name: 'Bob Marley',
      degree: 'B.E.',
      academicYear: 'Final Year',
      technicalSkills: ['Go', 'Docker', 'Kubernetes'],
      careerGoal: 'DevOps Engineer',
      teamSize: 'Solo (1 Student)',
    });

    const loadedA = storageService.getProfile(userA);
    const loadedB = storageService.getProfile(userB);

    expect(loadedA.name).toBe('Alice Cooper');
    expect(loadedA.technicalSkills).toEqual(['React', 'TypeScript']);

    expect(loadedB.name).toBe('Bob Marley');
    expect(loadedB.technicalSkills).toEqual(['Go', 'Docker', 'Kubernetes']);
  });
});
