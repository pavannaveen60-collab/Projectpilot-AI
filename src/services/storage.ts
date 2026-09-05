import {
  StudentProfile,
  ProjectIdea,
  ProjectBlueprint,
  ProjectRoadmap,
  MentorMessage,
  TaskStatus,
} from '../types';
import { apiService } from './api';

export const EMPTY_STUDENT_PROFILE: StudentProfile = {
  name: '',
  degree: '',
  branch: '',
  year: '',
  academicYear: '',
  programmingLanguages: [],
  technicalSkills: [],
  frameworks: [],
  interests: [],
  areasOfInterest: [],
  primaryInterests: [],
  preferredDomains: [],
  preferredDomain: '',
  skillLevel: '',
  difficulty: '',
  difficultyLevel: '',
  duration: '',
  availableDuration: '',
  teamSize: '',
  careerGoal: '',
  preferredStack: [],
  preferredTechnologies: [],
  isDemoProfile: false,
};

export const DEMO_STUDENT_PROFILE: StudentProfile = {
  name: 'Demo Student (Sample Profile)',
  degree: 'B.Tech / B.E.',
  branch: 'Computer Science & Engineering',
  year: 'Final Year (4th Year)',
  academicYear: 'Final Year (4th Year)',
  programmingLanguages: ['TypeScript', 'Python', 'JavaScript', 'SQL'],
  technicalSkills: ['React', 'REST APIs', 'Node.js / Express', 'Git', 'Data Structures'],
  frameworks: ['Tailwind CSS', 'Vite', 'FastAPI'],
  interests: ['Artificial Intelligence', 'Health-Tech', 'Full-Stack Systems', 'Cloud Native'],
  areasOfInterest: ['Artificial Intelligence', 'Health-Tech', 'Full-Stack Systems', 'Cloud Native'],
  primaryInterests: ['Artificial Intelligence', 'Health-Tech', 'Full-Stack Systems', 'Cloud Native'],
  preferredDomains: ['Healthcare', 'Education', 'Social Impact'],
  preferredDomain: 'Healthcare',
  skillLevel: 'Intermediate',
  difficulty: 'Intermediate',
  difficultyLevel: 'Intermediate',
  duration: '6 Months',
  availableDuration: '6 Months',
  teamSize: 'Solo (1 Student)',
  careerGoal: 'Full-Stack AI Software Engineer',
  preferredStack: ['React', 'Node.js', 'Firebase', 'Google Gemini API'],
  preferredTechnologies: ['Google Gemini API', 'Cloud Firestore', 'Docker', 'Google Cloud Run'],
  isDemoProfile: true,
};

// Aliased for backward compatibility
export const DEFAULT_STUDENT_PROFILE: StudentProfile = DEMO_STUDENT_PROFILE;

function getKey(userId: string, sub: string): string {
  return `projectpilot_${userId}_${sub}`;
}

export const storageService = {
  getProfile(userId: string): StudentProfile {
    try {
      // 1. Check primary Firestore collection key: users/{userId}
      const data = localStorage.getItem(`users/${userId}`) || localStorage.getItem(getKey(userId, 'profile'));
      if (data) {
        const parsed = JSON.parse(data);
        const resolvedName = parsed.name === 'Alex Morgan' ? '' : (parsed.name || parsed.fullName || '');
        return {
          ...EMPTY_STUDENT_PROFILE,
          ...parsed,
          name: resolvedName,
          fullName: resolvedName,
          userId,
          uid: userId,
        };
      }
    } catch (e) {
      console.error('Failed to read profile from storage', e);
    }

    // Default for any authenticated user is an empty profile requiring setup
    return {
      ...EMPTY_STUDENT_PROFILE,
      userId,
      uid: userId,
    };
  },

  saveProfile(userId: string, profile: StudentProfile): void {
    const cleanName = profile.name.trim();
    const docToSave: StudentProfile = {
      ...profile,
      name: cleanName,
      fullName: cleanName,
      userId,
      uid: userId,
      updatedAt: new Date().toISOString(),
    };

    // Ensure bidirectional aliases stay synchronized
    if (docToSave.year && !docToSave.academicYear) docToSave.academicYear = docToSave.year;
    if (docToSave.academicYear && !docToSave.year) docToSave.year = docToSave.academicYear;
    if (docToSave.interests && (!docToSave.areasOfInterest || docToSave.areasOfInterest.length === 0)) {
      docToSave.areasOfInterest = docToSave.interests;
    }
    if (docToSave.areasOfInterest && (!docToSave.interests || docToSave.interests.length === 0)) {
      docToSave.interests = docToSave.areasOfInterest;
    }
    if (docToSave.duration && !docToSave.availableDuration) docToSave.availableDuration = docToSave.duration;
    if (docToSave.availableDuration && !docToSave.duration) docToSave.duration = docToSave.availableDuration;
    if (docToSave.skillLevel && !docToSave.difficultyLevel) docToSave.difficultyLevel = docToSave.skillLevel;
    if (docToSave.difficulty && !docToSave.difficultyLevel) docToSave.difficultyLevel = docToSave.difficulty;
    if (docToSave.preferredDomains && docToSave.preferredDomains.length > 0 && !docToSave.preferredDomain) {
      docToSave.preferredDomain = docToSave.preferredDomains[0];
    }
    if (docToSave.preferredStack && (!docToSave.preferredTechnologies || docToSave.preferredTechnologies.length === 0)) {
      docToSave.preferredTechnologies = docToSave.preferredStack;
    }

    // 1. Store under Firestore schema path: users/{userId}
    localStorage.setItem(`users/${userId}`, JSON.stringify(docToSave));
    localStorage.setItem(getKey(userId, 'profile'), JSON.stringify(docToSave));

    // 2. Synchronize to server profile store in background
    apiService.saveUserProfile(userId, docToSave).catch(err => {
      console.warn('Background sync to server profile store failed:', err?.message || err);
    });
  },

  getActiveProject(userId: string): ProjectIdea | null {
    try {
      const data = localStorage.getItem(getKey(userId, 'active_project'));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read active project', e);
    }
    return null;
  },

  setActiveProject(userId: string, project: ProjectIdea): void {
    localStorage.setItem(getKey(userId, 'active_project'), JSON.stringify(project));
  },

  getSavedIdeas(userId: string): ProjectIdea[] {
    try {
      const data = localStorage.getItem(getKey(userId, 'saved_ideas'));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read saved ideas', e);
    }
    return [];
  },

  saveIdea(userId: string, idea: ProjectIdea): void {
    const list = this.getSavedIdeas(userId);
    if (!list.some(item => item.id === idea.id)) {
      list.unshift(idea);
      localStorage.setItem(getKey(userId, 'saved_ideas'), JSON.stringify(list));
    }
  },

  removeSavedIdea(userId: string, ideaId: string): void {
    const list = this.getSavedIdeas(userId).filter(i => i.id !== ideaId);
    localStorage.setItem(getKey(userId, 'saved_ideas'), JSON.stringify(list));
  },

  getBlueprint(userId: string, projectId: string): ProjectBlueprint | null {
    try {
      const data = localStorage.getItem(getKey(userId, `blueprint_${projectId}`));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read blueprint', e);
    }
    return null;
  },

  saveBlueprint(userId: string, blueprint: ProjectBlueprint): void {
    localStorage.setItem(getKey(userId, `blueprint_${blueprint.projectId}`), JSON.stringify(blueprint));
  },

  getRoadmap(userId: string, projectId: string): ProjectRoadmap | null {
    try {
      const data = localStorage.getItem(getKey(userId, `roadmap_${projectId}`));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read roadmap', e);
    }
    return null;
  },

  saveRoadmap(userId: string, roadmap: ProjectRoadmap): void {
    localStorage.setItem(getKey(userId, `roadmap_${roadmap.projectId}`), JSON.stringify(roadmap));
  },

  updateTaskStatus(userId: string, projectId: string, taskId: string, status: TaskStatus): ProjectRoadmap | null {
    const roadmap = this.getRoadmap(userId, projectId);
    if (!roadmap) return null;

    let found = false;
    roadmap.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        if (task.id === taskId) {
          task.status = status;
          if (status === 'completed') {
            task.completedAt = new Date().toISOString();
          } else {
            task.completedAt = undefined;
          }
          found = true;
        }
      });
    });

    if (found) {
      roadmap.updatedAt = new Date().toISOString();
      this.saveRoadmap(userId, roadmap);
    }
    return roadmap;
  },

  getMentorMessages(userId: string, projectId: string): MentorMessage[] {
    try {
      const data = localStorage.getItem(getKey(userId, `mentor_${projectId}`));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read mentor messages', e);
    }
    return [];
  },

  saveMentorMessages(userId: string, projectId: string, messages: MentorMessage[]): void {
    localStorage.setItem(getKey(userId, `mentor_${projectId}`), JSON.stringify(messages));
  },
};
