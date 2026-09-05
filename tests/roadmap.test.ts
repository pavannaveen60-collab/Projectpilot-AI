import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storage';
import { ProjectRoadmap, TaskStatus } from '../src/types';

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

describe('Development Roadmap & Milestone Progression Tests', () => {
  const userId = 'usr_test_student_789';
  const projectId = 'proj_ehr_triage';

  const mockRoadmap: ProjectRoadmap = {
    projectId,
    projectTitle: 'MediSync AI Capstone',
    phases: [
      {
        id: 'p1',
        phaseNumber: 1,
        title: 'Phase 1 — Requirements & Architecture',
        objective: 'Define problem scope, requirements and technical specification',
        expectedOutput: 'Approved SRS and architectural blueprint document',
        estimatedDuration: '1.5 Weeks',
        prerequisites: ['College faculty approval'],
        tasks: [
          {
            id: 't1_1',
            phaseId: 'p1',
            title: 'Define Problem Statement and Core User Personas',
            description: 'Interview triage nurses and compile stakeholder constraints.',
            estimatedHours: 6,
            status: 'not-started',
          },
          {
            id: 't1_2',
            phaseId: 'p1',
            title: 'System Architecture & Database Schema Design',
            description: 'Draft Firestore data models and security boundary rules.',
            estimatedHours: 8,
            status: 'not-started',
          },
        ],
      },
      {
        id: 'p2',
        phaseNumber: 2,
        title: 'Phase 2 — Core Backend & AI Integration',
        objective: 'Implement Express API gateways and Gemini Flash reasoning agent',
        expectedOutput: 'Working backend with verified AI responses',
        estimatedDuration: '2 Weeks',
        prerequisites: ['Phase 1 Architecture'],
        tasks: [
          {
            id: 't2_1',
            phaseId: 'p2',
            title: 'Setup Express API Proxy and In-Memory Cache',
            description: 'Configure server-side environment secrets and rate limits.',
            estimatedHours: 10,
            status: 'not-started',
          },
          {
            id: 't2_2',
            phaseId: 'p2',
            title: 'Integrate Google Gemini 3.8 Flash SDK',
            description: 'Implement structured schema generation with system instructions.',
            estimatedHours: 12,
            status: 'not-started',
          },
        ],
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
    storageService.saveRoadmap(userId, mockRoadmap);
  });

  it('persists and retrieves initial roadmap correctly', () => {
    const loaded = storageService.getRoadmap(userId, projectId);
    expect(loaded).toBeTruthy();
    expect(loaded?.projectTitle).toBe('MediSync AI Capstone');
    expect(loaded?.phases.length).toBe(2);
    expect(loaded?.phases[0].tasks.length).toBe(2);
  });

  it('updates task status from not-started to in-progress', () => {
    const updated = storageService.updateTaskStatus(userId, projectId, 't1_1', 'in-progress');
    expect(updated).toBeTruthy();
    const task = updated?.phases[0].tasks.find(t => t.id === 't1_1');
    expect(task?.status).toBe('in-progress');
    expect(task?.completedAt).toBeUndefined();
  });

  it('updates task status to completed and attaches completion timestamp', () => {
    const updated = storageService.updateTaskStatus(userId, projectId, 't1_1', 'completed');
    expect(updated).toBeTruthy();
    const task = updated?.phases[0].tasks.find(t => t.id === 't1_1');
    expect(task?.status).toBe('completed');
    expect(task?.completedAt).toBeTruthy();
    expect(new Date(task!.completedAt!).getTime()).not.toBeNaN();
  });

  it('computes accurate milestone completion percentage', () => {
    // 0 / 4 completed
    let loaded = storageService.getRoadmap(userId, projectId)!;
    let total = 0;
    let completed = 0;
    loaded.phases.forEach(p => p.tasks.forEach(t => {
      total++;
      if (t.status === 'completed') completed++;
    }));
    expect(Math.round((completed / total) * 100)).toBe(0);

    // Complete 1 of 4 tasks -> 25%
    storageService.updateTaskStatus(userId, projectId, 't1_1', 'completed');
    loaded = storageService.getRoadmap(userId, projectId)!;
    completed = 0;
    loaded.phases.forEach(p => p.tasks.forEach(t => {
      if (t.status === 'completed') completed++;
    }));
    expect(Math.round((completed / total) * 100)).toBe(25);

    // Complete 2 of 4 tasks -> 50%
    storageService.updateTaskStatus(userId, projectId, 't1_2', 'completed');
    loaded = storageService.getRoadmap(userId, projectId)!;
    completed = 0;
    loaded.phases.forEach(p => p.tasks.forEach(t => {
      if (t.status === 'completed') completed++;
    }));
    expect(Math.round((completed / total) * 100)).toBe(50);
  });

  it('correctly derives next recommended task', () => {
    // Initially first uncompleted task is t1_1
    let loaded = storageService.getRoadmap(userId, projectId)!;
    let nextTask = null;
    for (const phase of loaded.phases) {
      for (const task of phase.tasks) {
        if (task.status !== 'completed') {
          nextTask = task;
          break;
        }
      }
      if (nextTask) break;
    }
    expect(nextTask?.id).toBe('t1_1');

    // After completing t1_1, next recommended task advances to t1_2
    storageService.updateTaskStatus(userId, projectId, 't1_1', 'completed');
    loaded = storageService.getRoadmap(userId, projectId)!;
    nextTask = null;
    for (const phase of loaded.phases) {
      for (const task of phase.tasks) {
        if (task.status !== 'completed') {
          nextTask = task;
          break;
        }
      }
      if (nextTask) break;
    }
    expect(nextTask?.id).toBe('t1_2');
  });
});
