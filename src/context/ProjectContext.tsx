import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  StudentProfile,
  ProjectIdea,
  ProjectBlueprint,
  ProjectRoadmap,
  TaskStatus,
  RoadmapTask,
} from '../types';
import { storageService, EMPTY_STUDENT_PROFILE, DEMO_STUDENT_PROFILE } from '../services/storage';
import { useAuth } from './AuthContext';
import { calculateProfileCompletion, ProfileCompletionResult } from '../utils/profileCompletion';

interface ProjectContextType {
  profile: StudentProfile;
  loading: boolean;
  setProfile: (profile: StudentProfile) => void;
  updateProfileName: (name: string) => void;
  resetProfile: () => void;
  loadDemoProfile: () => void;
  profileCompletion: ProfileCompletionResult;
  isProfileComplete: boolean;
  canGenerateIdeas: boolean;
  activeProject: ProjectIdea | null;
  selectProject: (project: ProjectIdea) => void;
  savedIdeas: ProjectIdea[];
  saveIdea: (idea: ProjectIdea) => void;
  removeIdea: (ideaId: string) => void;
  blueprint: ProjectBlueprint | null;
  setBlueprint: (bp: ProjectBlueprint) => void;
  roadmap: ProjectRoadmap | null;
  setRoadmap: (rm: ProjectRoadmap) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  roadmapStats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    percentage: number;
    nextRecommendedTask: RoadmapTask | null;
  };
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentUser, updateDisplayName } = useAuth();
  const userId = currentUser?.uid || currentUser?.userId || 'guest_user';

  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfileState] = useState<StudentProfile>(() => storageService.getProfile(userId));
  const [activeProject, setActiveProjectState] = useState<ProjectIdea | null>(null);
  const [savedIdeas, setSavedIdeas] = useState<ProjectIdea[]>([]);
  const [blueprint, setBlueprintState] = useState<ProjectBlueprint | null>(null);
  const [roadmap, setRoadmapState] = useState<ProjectRoadmap | null>(null);

  // Load user data on mount / user change
  useEffect(() => {
    setLoading(true);
    const loadedProfile = storageService.getProfile(userId);
    setProfileState(loadedProfile);

    // If profile has a name, synchronize with currentUser.displayName
    if (loadedProfile.name && loadedProfile.name !== currentUser?.displayName) {
      updateDisplayName(loadedProfile.name);
    }

    const active = storageService.getActiveProject(userId);
    setActiveProjectState(active);

    const saved = storageService.getSavedIdeas(userId);
    setSavedIdeas(saved);

    if (active) {
      const bp = storageService.getBlueprint(userId, active.id);
      setBlueprintState(bp);

      const rm = storageService.getRoadmap(userId, active.id);
      setRoadmapState(rm);
    } else {
      setBlueprintState(null);
      setRoadmapState(null);
    }
    setLoading(false);
  }, [userId]);

  const profileCompletion = useMemo(() => {
    return calculateProfileCompletion(profile);
  }, [profile]);

  const setProfile = (newProfile: StudentProfile) => {
    const cleanName = (newProfile.name || newProfile.fullName || '').trim();
    const cleanProfile: StudentProfile = {
      ...newProfile,
      name: cleanName,
      fullName: cleanName,
      userId,
      uid: userId,
      updatedAt: new Date().toISOString(),
    };
    setProfileState(cleanProfile);
    storageService.saveProfile(userId, cleanProfile);
    if (cleanName) {
      updateDisplayName(cleanName);
    }
  };

  const updateProfileName = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updated: StudentProfile = {
      ...profile,
      name: trimmed,
      fullName: trimmed,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);
  };

  const resetProfile = () => {
    const empty = { ...EMPTY_STUDENT_PROFILE, userId, uid: userId };
    setProfileState(empty);
    storageService.saveProfile(userId, empty);
  };

  const loadDemoProfile = () => {
    const demo = { ...DEMO_STUDENT_PROFILE, userId, uid: userId, isDemoProfile: true };
    setProfileState(demo);
    storageService.saveProfile(userId, demo);
  };

  const selectProject = (project: ProjectIdea) => {
    setActiveProjectState(project);
    storageService.setActiveProject(userId, project);
    thisSaveIdea(project);

    const bp = storageService.getBlueprint(userId, project.id);
    setBlueprintState(bp);

    const rm = storageService.getRoadmap(userId, project.id);
    setRoadmapState(rm);
  };

  const thisSaveIdea = (idea: ProjectIdea) => {
    storageService.saveIdea(userId, idea);
    setSavedIdeas(storageService.getSavedIdeas(userId));
  };

  const removeIdea = (ideaId: string) => {
    storageService.removeSavedIdea(userId, ideaId);
    setSavedIdeas(storageService.getSavedIdeas(userId));
  };

  const setBlueprint = (bp: ProjectBlueprint) => {
    setBlueprintState(bp);
    storageService.saveBlueprint(userId, bp);
  };

  const setRoadmap = (rm: ProjectRoadmap) => {
    setRoadmapState(rm);
    storageService.saveRoadmap(userId, rm);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (!activeProject) return;
    const updated = storageService.updateTaskStatus(userId, activeProject.id, taskId, status);
    if (updated) {
      setRoadmapState({ ...updated });
    }
  };

  // Compute stats
  const roadmapStats = useMemo(() => {
    if (!roadmap || !roadmap.phases) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        percentage: 0,
        nextRecommendedTask: null,
      };
    }

    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let nextTask: RoadmapTask | null = null;

    for (const phase of roadmap.phases) {
      for (const task of phase.tasks) {
        total++;
        if (task.status === 'completed') {
          completed++;
        } else if (task.status === 'in-progress') {
          inProgress++;
          if (!nextTask) nextTask = task;
        } else if (task.status === 'not-started') {
          if (!nextTask) nextTask = task;
        }
      }
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      percentage,
      nextRecommendedTask: nextTask,
    };
  }, [roadmap]);

  return (
    <ProjectContext.Provider
      value={{
        profile,
        loading,
        setProfile,
        updateProfileName,
        resetProfile,
        loadDemoProfile,
        profileCompletion,
        isProfileComplete: profileCompletion.isMinimallyComplete,
        canGenerateIdeas: profileCompletion.canGenerateIdeas,
        activeProject,
        selectProject,
        savedIdeas,
        saveIdea: thisSaveIdea,
        removeIdea,
        blueprint,
        setBlueprint,
        roadmap,
        setRoadmap,
        updateTaskStatus,
        roadmapStats,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
