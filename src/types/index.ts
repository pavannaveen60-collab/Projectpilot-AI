export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | 'Final Year (4th Year)' | 'Final Year (Semester 8)' | 'Final Year' | 'Master / Post-Grad' | string;

export type DifficultyLevel = 'Beginner-Friendly' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Challenging' | 'Research-Grade' | string;

export type TeamSize = 'Solo (1 Student)' | 'Individual' | 'Pair (2 Students)' | '2 members' | '3 members' | 'Small Team (3-4 Students)' | '4 members' | '5+ members' | string;

export interface StudentProfile {
  id?: string;
  userId?: string;
  uid?: string; // Aliased to userId for Firebase compatibility
  email?: string;
  name: string;
  fullName?: string; // Aliased to name for schema compatibility
  degree: string;
  branch?: string; // Branch / Specialization (e.g. Computer Science, IT, AI & DS)
  year?: string; // Academic Year (e.g. 1st Year, 2nd Year, 3rd Year, Final Year)
  academicYear: AcademicYear;
  programmingLanguages?: string[]; // Multi-select + custom
  technicalSkills: string[]; // Multi-select + custom
  frameworks?: string[]; // Multi-select + custom
  interests?: string[]; // Areas of interest
  areasOfInterest?: string[]; // Aliased for compatibility
  primaryInterests?: string[]; // Aliased for compatibility
  preferredDomains?: string[]; // Multi-select preferred project domains
  preferredDomain?: string; // Primary or first domain
  targetIndustry?: string;
  skillLevel?: string; // 'Beginner' | 'Intermediate' | 'Advanced'
  difficulty?: string; // 'Beginner' | 'Intermediate' | 'Advanced' | 'Challenging'
  difficultyLevel?: DifficultyLevel;
  duration?: string; // '2–4 weeks' | '1–2 months' | '2–3 months' | '3–6 months' | '6+ months'
  availableDuration?: string;
  teamSize: TeamSize;
  careerGoal: string;
  preferredStack?: string[]; // Categorized stack selections (Frontend, Backend, DB, AI)
  preferredTechnologies?: string[];
  preferredProjectTypes?: string[];
  weeklyHours?: number;
  hasHardwareConstraints?: boolean;
  hardwareConstraintDetails?: string;
  wantsResearchFocus?: boolean;
  isDemoProfile?: boolean; // Clearly labels sample/demo data vs real student data
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFitScores {
  skillMatch: number; // 0 - 100
  feasibility: number; // 0 - 100
  innovation: number; // 0 - 100
  careerRelevance: number; // 0 - 100
  timeSuitability: number; // 0 - 100
  overallFit: number; // 0 - 100
  explanation: {
    skillMatch: string;
    feasibility: string;
    innovation: string;
    careerRelevance: string;
    timeSuitability: string;
    overallSummary: string;
  };
}

export interface ProjectTechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  aiOrMl: string[];
  cloudOrDevOps: string[];
}

export interface ProjectIdea {
  id: string;
  title: string;
  shortDescription: string;
  problemStatement: string;
  targetUsers: string[];
  realWorldUseCase: string;
  coreFeatures: string[];
  recommendedTechStack: ProjectTechStack;
  aiComponent: string;
  requiredSkills: string[];
  skillsToLearn: string[];
  estimatedDuration: string;
  difficulty: DifficultyLevel;
  innovationFactor: string;
  careerRelevance: string;
  potentialChallenges: string[];
  futureScope: string[];
  fitScores?: ProjectFitScores;
  createdAt?: string;
}

export interface DatabaseSchemaEntity {
  name: string;
  description: string;
  fields: { name: string; type: string; description: string }[];
}

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  description: string;
  requestPayload?: string;
  responsePayload?: string;
}

export interface ProjectBlueprint {
  id: string;
  projectId: string;
  projectTitle: string;
  overview: string;
  problemStatement: string;
  proposedSolution: string;
  targetUsers: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  coreFeatures: string[];
  technologyStack: ProjectTechStack;
  systemArchitecture: string;
  databaseDesign: DatabaseSchemaEntity[];
  apiRequirements: ApiEndpointSpec[];
  authenticationStrategy: string;
  aiIntegrationArchitecture: string;
  developmentPhases: string[];
  testingStrategy: string[];
  deploymentPlan: string;
  securityConsiderations: string[];
  futureEnhancements: string[];
  generatedAt: string;
}

export type TaskStatus = 'not-started' | 'in-progress' | 'completed';

export interface RoadmapTask {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  estimatedHours: number;
  status: TaskStatus;
  prerequisites?: string[];
  completedAt?: string;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  objective: string;
  expectedOutput: string;
  estimatedDuration: string;
  prerequisites: string[];
  tasks: RoadmapTask[];
}

export interface ProjectRoadmap {
  projectId: string;
  projectTitle: string;
  phases: RoadmapPhase[];
  updatedAt: string;
}

export interface MentorMessage {
  id: string;
  userId?: string;
  projectId?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  createdAt?: string;
  contextSnapshot?: {
    currentPhaseTitle?: string;
    currentTaskTitle?: string;
    techStackSummary?: string;
  };
}

export interface ProjectImprovementAnalysis {
  originalIdea: string;
  weaknesses: string[];
  missingFeatures: string[];
  aiOpportunities: string[];
  securityImprovements: string[];
  scalabilityImprovements: string[];
  uxImprovements: string[];
  technicalImprovements: string[];
  innovationOpportunities: string[];
  improvedProject: {
    title: string;
    elevatedProblemStatement: string;
    improvedArchitecture: string;
    upgradedFeatures: string[];
    modernTechStack: ProjectTechStack;
    novelAiHook: string;
    industryReadinessFactor: string;
  };
}

export interface FeasibilityValidationResult {
  projectTitle: string;
  isRealistic: boolean;
  isSuitableForFinalYear: boolean;
  isAchievableInTime: boolean;
  matchesSkills: boolean;
  scopeAssessment: 'Scope Too Small' | 'Balanced Scope (Ideal)' | 'Scope Too Large (MVP Recommended)';
  overallVerdict: string;
  featureBreakdown: {
    totalIdentified: number;
    recommendedMvpCount: number;
    futureScopeCount: number;
  };
  recommendedMvpFeatures: string[];
  futureScopeFeatures: string[];
  riskMitigationStrategies: string[];
  suggestedTimelineMonths: number;
}

export interface UserSession {
  uid: string; // Authenticated Firebase / session UID
  userId: string; // Backward compatibility alias
  email: string;
  displayName: string;
  photoURL?: string;
  token?: string;
  isDemo?: boolean;
}
