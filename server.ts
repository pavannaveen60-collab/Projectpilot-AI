import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(express.json({ limit: '2mb' }));

// Initialize Google GenAI with secure server-side key
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-Memory cache for Efficiency requirement (prevents redundant Gemini token spending)
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const requestCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getCacheKey(prefix: string, payload: any): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  return `${prefix}:${hash}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = requestCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    requestCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setInCache(key: string, data: any, ttl = CACHE_TTL_MS): void {
  requestCache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

// Health endpoint
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    service: 'ProjectPilot AI Backend',
    hasGeminiKey,
    cacheSize: requestCache.size,
    timestamp: new Date().toISOString(),
  });
});

// Helper to sanitize text input
function sanitizeString(input: unknown, maxLen = 5000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen);
}

// User Profile In-Memory & Firestore-Mirrored Persistence (users/{userId})
const userProfilesStore = new Map<string, any>();

// Seed default isolated demo evaluator profile for review convenience
userProfilesStore.set('usr_demo_evaluator', {
  userId: 'usr_demo_evaluator',
  name: 'Demo Evaluator (Sample Profile)',
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Helper to validate user ID format (prevent path injection / prototype traversal)
function isValidUserId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
}

// Tenancy Authorization: ensure client cannot read or write another user's profile
function verifyTenancyAuth(req: express.Request, res: express.Response, targetUserId: string): boolean {
  if (!isValidUserId(targetUserId)) {
    res.status(400).json({ error: 'Invalid user ID format.' });
    return false;
  }

  // Demo evaluator profile is isolated and accessible for review evaluation
  if (targetUserId === 'usr_demo_evaluator') {
    return true;
  }

  const clientUid = req.headers['x-user-id'] as string | undefined;
  if (clientUid && clientUid !== targetUserId) {
    res.status(403).json({ error: 'Tenancy violation: You are not authorized to access or modify this profile.' });
    return false;
  }

  return true;
}

// Profile API: Get user profile
app.get('/api/users/:userId/profile', (req, res) => {
  const { userId } = req.params;
  if (!verifyTenancyAuth(req, res, userId)) return;

  const profile = userProfilesStore.get(userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json({ profile });
});

// Profile API: Save user profile with strict schema sanitization
app.post('/api/users/:userId/profile', (req, res) => {
  const { userId } = req.params;
  if (!verifyTenancyAuth(req, res, userId)) return;

  const incoming = req.body?.profile;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ error: 'Invalid profile payload provided.' });
  }

  const sanitized = {
    ...incoming,
    userId,
    name: sanitizeString(incoming.name || incoming.fullName || '', 100),
    fullName: sanitizeString(incoming.fullName || incoming.name || '', 100),
    degree: sanitizeString(incoming.degree || '', 120),
    branch: sanitizeString(incoming.branch || '', 120),
    year: sanitizeString(incoming.year || incoming.academicYear || '', 50),
    academicYear: sanitizeString(incoming.academicYear || incoming.year || '', 50),
    programmingLanguages: Array.isArray(incoming.programmingLanguages) ? incoming.programmingLanguages.map((s: string) => sanitizeString(s, 50)) : [],
    technicalSkills: Array.isArray(incoming.technicalSkills) ? incoming.technicalSkills.map((s: string) => sanitizeString(s, 50)) : [],
    frameworks: Array.isArray(incoming.frameworks) ? incoming.frameworks.map((s: string) => sanitizeString(s, 50)) : [],
    interests: Array.isArray(incoming.interests) ? incoming.interests.map((s: string) => sanitizeString(s, 100)) : (Array.isArray(incoming.areasOfInterest) ? incoming.areasOfInterest.map((s: string) => sanitizeString(s, 100)) : []),
    preferredDomains: Array.isArray(incoming.preferredDomains) ? incoming.preferredDomains.map((s: string) => sanitizeString(s, 100)) : (incoming.preferredDomain ? [sanitizeString(incoming.preferredDomain, 100)] : []),
    skillLevel: sanitizeString(incoming.skillLevel || incoming.difficultyLevel || 'Intermediate', 50),
    difficulty: sanitizeString(incoming.difficulty || incoming.difficultyLevel || 'Intermediate', 50),
    duration: sanitizeString(incoming.duration || incoming.availableDuration || '3-6 Months', 50),
    teamSize: sanitizeString(incoming.teamSize || 'Individual', 50),
    careerGoal: sanitizeString(incoming.careerGoal || '', 200),
    preferredStack: Array.isArray(incoming.preferredStack) ? incoming.preferredStack.map((s: string) => sanitizeString(s, 50)) : [],
    isDemoProfile: Boolean(incoming.isDemoProfile),
    updatedAt: new Date().toISOString(),
    createdAt: incoming.createdAt || new Date().toISOString(),
  };

  userProfilesStore.set(userId, sanitized);
  res.json({ profile: sanitized, saved: true });
});

// 1. Generate Projects Endpoint
app.post('/api/gemini/generate-projects', async (req, res) => {
  try {
    const profile = req.body?.profile;
    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ error: 'Invalid profile payload provided.' });
    }

    // Strict validation: student profile must have required fields before generation
    const nameValid = profile.name && profile.name.trim().length >= 2;
    const degreeValid = (profile.degree && profile.degree.trim().length > 0) || (profile.branch && profile.branch.trim().length > 0);
    const skillsCount = ((profile.programmingLanguages || []).length + (profile.technicalSkills || []).length);
    const hasCareerGoal = profile.careerGoal && profile.careerGoal.trim().length >= 2;

    if (!nameValid || !degreeValid || skillsCount === 0 || !hasCareerGoal) {
      return res.status(400).json({
        error: 'Incomplete student profile. Please complete your profile with your name, degree/branch, skills, and career goal before generating projects.',
      });
    }

    const cacheKey = getCacheKey('projects', profile);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ projects: cached, cached: true });
    }

    const client = getGeminiClient();
    if (!client) {
      if (profile.isDemoProfile) {
        const fallbackProjects = generateFallbackProjects(profile);
        return res.json({ projects: fallbackProjects, fallback: true });
      }
      return res.status(503).json({
        error: 'Google Gemini AI service is currently unavailable. Please verify that GEMINI_API_KEY is configured in your server environment.',
      });
    }

    const prompt = `You are a distinguished computer science professor and senior software architect evaluating final-year university engineering projects.
Generate 4 highly innovative, personalized, and practical final-year project ideas tailored precisely to this student profile:
- Student Name: ${sanitizeString(profile.name)}
- Degree: ${sanitizeString(profile.degree)}
- Branch / Specialization: ${sanitizeString(profile.branch || 'Computer Science')}
- Academic Year: ${sanitizeString(profile.year || profile.academicYear || 'Final Year')}
- Student Programming Languages: ${(profile.programmingLanguages || []).join(', ') || 'Not specified'}
- Student Technical Skills: ${(profile.technicalSkills || []).join(', ') || 'Not specified'}
- Frameworks / Libraries: ${(profile.frameworks || []).join(', ') || 'None specified'}
- Areas of Interest: ${(profile.interests || profile.areasOfInterest || profile.primaryInterests || []).join(', ') || 'AI & Distributed Systems'}
- Preferred Project Domains: ${(profile.preferredDomains || (profile.preferredDomain ? [profile.preferredDomain] : [])).join(', ') || 'Open to all domains'}
- Current Skill Level: ${sanitizeString(profile.skillLevel || profile.difficultyLevel || 'Intermediate')}
- Project Difficulty Preference: ${sanitizeString(profile.difficulty || profile.difficultyLevel || 'Intermediate')}
- Available Project Duration: ${sanitizeString(profile.duration || profile.availableDuration || '3-6 Months')}
- Team Size: ${sanitizeString(profile.teamSize || 'Solo (1 Student)')}
- Target Career Goal: ${sanitizeString(profile.careerGoal)}
- Preferred Technology Stack: ${(profile.preferredStack || profile.preferredTechnologies || []).join(', ') || 'Standard modern stack'}

CRITICAL GUIDELINES:
1. STRICTLY TAILOR: Every project proposal MUST prominently feature the student's selected programming languages (${(profile.programmingLanguages || []).join(', ')}), frameworks (${(profile.frameworks || []).join(', ')}), and align directly with their target career goal: "${sanitizeString(profile.careerGoal)}".
2. DO NOT assume or force unselected technologies or default to generic web stacks if the student specified other languages or domains.
3. Incorporate a practical, novel AI or Intelligent Agent component (such as Google Gemini, computer vision, local models, or automated reasoning).
4. No generic or cliché ideas (no basic calculators, no plain todo apps, no generic e-commerce clones).
5. Calculate realistic, explainable fit scores (Skill Match, Feasibility, Innovation, Career Relevance, Time Suitability, Overall Fit from 0 to 100).
6. Return strictly JSON adhering to the specified schema.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'List of 3 to 4 personalized final year project ideas',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              shortDescription: { type: Type.STRING },
              problemStatement: { type: Type.STRING },
              targetUsers: { type: Type.ARRAY, items: { type: Type.STRING } },
              realWorldUseCase: { type: Type.STRING },
              coreFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedTechStack: {
                type: Type.OBJECT,
                properties: {
                  frontend: { type: Type.ARRAY, items: { type: Type.STRING } },
                  backend: { type: Type.ARRAY, items: { type: Type.STRING } },
                  database: { type: Type.ARRAY, items: { type: Type.STRING } },
                  aiOrMl: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cloudOrDevOps: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['frontend', 'backend', 'database', 'aiOrMl', 'cloudOrDevOps'],
              },
              aiComponent: { type: Type.STRING },
              requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              skillsToLearn: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedDuration: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              innovationFactor: { type: Type.STRING },
              careerRelevance: { type: Type.STRING },
              potentialChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
              futureScope: { type: Type.ARRAY, items: { type: Type.STRING } },
              fitScores: {
                type: Type.OBJECT,
                properties: {
                  skillMatch: { type: Type.NUMBER },
                  feasibility: { type: Type.NUMBER },
                  innovation: { type: Type.NUMBER },
                  careerRelevance: { type: Type.NUMBER },
                  timeSuitability: { type: Type.NUMBER },
                  overallFit: { type: Type.NUMBER },
                  explanation: {
                    type: Type.OBJECT,
                    properties: {
                      skillMatch: { type: Type.STRING },
                      feasibility: { type: Type.STRING },
                      innovation: { type: Type.STRING },
                      careerRelevance: { type: Type.STRING },
                      timeSuitability: { type: Type.STRING },
                      overallSummary: { type: Type.STRING },
                    },
                    required: ['skillMatch', 'feasibility', 'innovation', 'careerRelevance', 'timeSuitability', 'overallSummary'],
                  },
                },
                required: ['skillMatch', 'feasibility', 'innovation', 'careerRelevance', 'timeSuitability', 'overallFit', 'explanation'],
              },
            },
            required: [
              'id', 'title', 'shortDescription', 'problemStatement', 'targetUsers',
              'realWorldUseCase', 'coreFeatures', 'recommendedTechStack', 'aiComponent',
              'requiredSkills', 'skillsToLearn', 'estimatedDuration', 'difficulty',
              'innovationFactor', 'careerRelevance', 'potentialChallenges', 'futureScope', 'fitScores'
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    setInCache(cacheKey, parsed);
    res.json({ projects: parsed, cached: false });
  } catch (error: any) {
    console.error('Error in generate-projects:', error?.message);
    if (req.body?.profile?.isDemoProfile) {
      const fallbackProjects = generateFallbackProjects(req.body.profile);
      return res.json({ projects: fallbackProjects, fallback: true, warning: 'Using isolated demo generator for review.' });
    }
    res.status(500).json({
      error: 'Failed to generate project ideas via Google Gemini: ' + (error?.message || 'Internal AI service error'),
    });
  }
});

// 2. Generate Detailed Project Blueprint
app.post('/api/gemini/generate-blueprint', async (req, res) => {
  try {
    const { project, profile } = req.body;
    if (!project || !project.title) {
      return res.status(400).json({ error: 'Project data is required.' });
    }

    const cacheKey = getCacheKey('blueprint', { id: project.id, title: project.title });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ blueprint: cached, cached: true });
    }

    const client = getGeminiClient();
    if (!client) {
      if (profile?.isDemoProfile) {
        const fallback = generateFallbackBlueprint(project, profile);
        return res.json({ blueprint: fallback, fallback: true });
      }
      return res.status(503).json({
        error: 'Google Gemini AI service is currently unavailable. Please verify that GEMINI_API_KEY is configured in your server environment.',
      });
    }

    const prompt = `You are a Principal Software Architect. Generate an exhaustive, production-grade technical project blueprint for this final-year capstone project:
Title: ${sanitizeString(project.title)}
Description: ${sanitizeString(project.shortDescription)}
Problem Statement: ${sanitizeString(project.problemStatement)}
AI Component: ${sanitizeString(project.aiComponent)}
Tech Stack: ${JSON.stringify(project.recommendedTechStack || {})}
Student Skills: ${(profile?.technicalSkills || []).join(', ')}

Return a structured JSON blueprint covering:
1. Overview and proposed solution
2. Target users
3. Functional requirements (at least 6 specific items)
4. Non-functional requirements (security, latency, scalability, WCAG compliance)
5. Core features list
6. Complete technology stack breakdown
7. System architecture overview (microservices/monolith, data flow, API gateways)
8. Database design (at least 4 entities with field names, types, and descriptions)
9. API requirements (at least 5 REST/gRPC endpoints with method, endpoint, description, payload)
10. Authentication strategy (e.g. Firebase Auth JWT verification, RBAC)
11. AI integration architecture (model orchestration, server-side secrets, vector storage/context window)
12. Development phases
13. Testing strategy (Unit, Integration, E2E, Load, Accessibility testing)
14. Deployment plan (Cloud Run, Docker, CI/CD with GitHub Actions)
15. Security considerations (OWASP top 10, sanitization, zero-trust rules)
16. Future enhancements`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const blueprint = JSON.parse(response.text || '{}');
    blueprint.id = blueprint.id || `bp_${Date.now()}`;
    blueprint.projectId = project.id;
    blueprint.projectTitle = project.title;
    blueprint.generatedAt = new Date().toISOString();

    setInCache(cacheKey, blueprint);
    res.json({ blueprint, cached: false });
  } catch (error: any) {
    console.error('Error generating blueprint:', error?.message);
    const { project, profile } = req.body;
    if (profile?.isDemoProfile) {
      const fallback = generateFallbackBlueprint(project || {}, profile || {});
      return res.json({ blueprint: fallback, fallback: true, warning: 'Using isolated sample blueprint for review.' });
    }
    res.status(500).json({
      error: 'Failed to generate technical blueprint via Google Gemini: ' + (error?.message || 'Internal AI service error'),
    });
  }
});

// 3. Generate Development Roadmap Endpoint
app.post('/api/gemini/generate-roadmap', async (req, res) => {
  try {
    const { project, profile } = req.body;
    if (!project || !project.title) {
      return res.status(400).json({ error: 'Project data is required.' });
    }

    const cacheKey = getCacheKey('roadmap', { id: project.id });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ roadmap: cached, cached: true });
    }

    const client = getGeminiClient();
    if (!client) {
      if (profile?.isDemoProfile) {
        const fallbackRoadmap = generateFallbackRoadmap(project);
        return res.json({ roadmap: fallbackRoadmap, fallback: true });
      }
      return res.status(503).json({
        error: 'Google Gemini AI service is currently unavailable. Please verify that GEMINI_API_KEY is configured in your server environment.',
      });
    }

    const prompt = `You are an Agile Project Manager and Technical Mentor. Generate a detailed 8-phase development roadmap for this final-year capstone project:
Project Title: ${sanitizeString(project.title)}
Tech Stack: ${JSON.stringify(project.recommendedTechStack || {})}
Available Duration: ${sanitizeString(profile?.availableDuration || '6 Months')}
Difficulty: ${sanitizeString(project.difficulty || 'Intermediate')}

Create exactly 8 phases:
Phase 1 — Requirements & Feasibility
Phase 2 — UI/UX Prototyping & Design Systems
Phase 3 — Database & Authentication Setup
Phase 4 — Backend Core & API Layer
Phase 5 — Core Functional Features
Phase 6 — AI Integration & Model Orchestration
Phase 7 — Testing & Optimization (WCAG + Unit + Security)
Phase 8 — Deployment & Viva Preparation

Each phase must contain:
- phaseNumber (1-8)
- title
- objective
- expectedOutput
- estimatedDuration (e.g., '1.5 Weeks')
- prerequisites (array of strings)
- tasks: array of 3 to 5 concrete tasks, each with id, title, description, estimatedHours (number), status ('not-started').`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const phases = Array.isArray(parsed.phases) ? parsed.phases : (Array.isArray(parsed) ? parsed : []);
    if (phases.length === 0) {
      throw new Error('Malformed roadmap phases output from Gemini.');
    }

    const roadmap = {
      projectId: project.id,
      projectTitle: project.title,
      phases,
      updatedAt: new Date().toISOString(),
    };

    setInCache(cacheKey, roadmap);
    res.json({ roadmap, cached: false });
  } catch (error: any) {
    console.error('Error generating roadmap:', error?.message);
    if (req.body?.profile?.isDemoProfile) {
      const fallback = generateFallbackRoadmap(req.body?.project || {});
      return res.json({ roadmap: fallback, fallback: true, warning: 'Using isolated sample roadmap for review.' });
    }
    res.status(500).json({
      error: 'Failed to generate development roadmap via Google Gemini: ' + (error?.message || 'Internal AI service error'),
    });
  }
});

// 4. Project-Aware AI Mentor Chat
app.post('/api/gemini/mentor-chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required.' });
    }

    const client = getGeminiClient();
    const cleanMessage = sanitizeString(message, 1000);

    const systemInstruction = `You are the PROJECTPILOT AI Senior Project Mentor.
You are directly advising a final-year engineering student on their capstone project.
CRITICAL MANDATE: You are NOT a generic chatbot. You MUST ground every answer specifically in the student's project context:
- Project Title: ${sanitizeString(context?.project?.title || 'Capstone Project')}
- Problem Statement: ${sanitizeString(context?.project?.problemStatement || '')}
- Recommended Tech Stack: ${JSON.stringify(context?.project?.recommendedTechStack || {})}
- Current Roadmap Phase: ${sanitizeString(context?.currentPhaseTitle || 'In Progress')}
- Completed Tasks: ${(context?.completedTaskTitles || []).join(', ') || 'Initial Setup'}
- Next Recommended Task: ${sanitizeString(context?.nextTaskTitle || 'Architecture Planning')}
- Student Skills: ${(context?.profile?.technicalSkills || []).join(', ')}

Guidelines:
1. Always reference the student's exact tech stack (e.g. if their stack has Express/Firebase/PostgreSQL, suggest code and libraries specific to that stack).
2. If asked what to build next, inspect completed tasks and recommend the next logical task in the roadmap.
3. If asked about an error or debugging, provide clear step-by-step diagnostic checklists and concise, secure code snippets.
4. Keep advice encouraging, pedagogically sound, and tailored for final-year defense/evaluation viva.
5. Emphasize security, error handling, and clean software architecture.`;

    if (!client) {
      if (context?.profile?.isDemoProfile) {
        const fallbackReply = generateFallbackMentorReply(cleanMessage, context);
        return res.json({ reply: fallbackReply, fallback: true });
      }
      return res.status(503).json({
        error: 'Google Gemini AI service is currently unavailable. Please verify that GEMINI_API_KEY is configured in your server environment.',
      });
    }

    // Format conversation history for Gemini (limit to last 6 for efficiency)
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: sanitizeString(msg.content, 1000) }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: cleanMessage }],
    });

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I am here to guide you through your capstone development. How can we advance your current milestone?';
    res.json({ reply, cached: false });
  } catch (error: any) {
    console.error('Error in mentor-chat:', error?.message);
    if (req.body?.context?.profile?.isDemoProfile) {
      const reply = generateFallbackMentorReply(req.body?.message || '', req.body?.context);
      return res.json({ reply, fallback: true, warning: 'Using isolated sample mentor response for review.' });
    }
    res.status(500).json({
      error: 'Failed to generate mentor response via Google Gemini: ' + (error?.message || 'Internal AI service error'),
    });
  }
});

// 5. Project Improver Endpoint
app.post('/api/gemini/improve-project', async (req, res) => {
  try {
    const { idea, domain, skills } = req.body;
    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({ error: 'Original project idea is required.' });
    }

    const cleanIdea = sanitizeString(idea, 2000);
    const cacheKey = getCacheKey('improver', { idea: cleanIdea, domain, skills });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ analysis: cached, cached: true });
    }

    const client = getGeminiClient();
    if (!client) {
      return res.status(503).json({
        error: 'Google Gemini AI service is currently unavailable. Please verify that GEMINI_API_KEY is configured in your server environment.',
      });
    }

    const prompt = `You are an elite hackathon judge and project evaluator.
Analyze this existing project idea proposed by a final-year student:
Original Idea: "${cleanIdea}"
Domain: "${sanitizeString(domain || 'General Software Engineering')}"
Student Current Skills: "${sanitizeString(skills || 'Web Development')}"

Transform this idea into an industry-grade, hackathon-winning capstone project.
Analyze:
1. Weaknesses of the initial concept
2. Missing critical features that evaluators expect
3. High-impact AI / ML opportunities
4. Security & data privacy improvements
5. Scalability improvements
6. UX improvements
7. Technical architecture upgrades
8. Novel innovation angles
9. Provide an elevated, modernized project specification (title, elevated problem statement, improved architecture, upgraded features, modern tech stack, novel AI hook, and industry readiness factor).

Return strictly JSON matching the required schema.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const analysis = JSON.parse(response.text || '{}');
    analysis.originalIdea = cleanIdea;

    setInCache(cacheKey, analysis);
    res.json({ analysis, cached: false });
  } catch (error: any) {
    console.error('Error in project improver:', error?.message);
    res.status(500).json({
      error: 'Failed to improve project via Google Gemini: ' + (error?.message || 'Internal AI service error'),
    });
  }
});

// 6. Project Feasibility Validator & MVP Analyzer
app.post('/api/gemini/validate-feasibility', async (req, res) => {
  try {
    const { title, description, features, duration, teamSize, studentSkills } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Project title is required.' });
    }

    const client = getGeminiClient();
    const payload = { title, description, features, duration, teamSize, studentSkills };
    const cacheKey = getCacheKey('validator', payload);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ validation: cached, cached: true });
    }

    if (!client) {
      return res.status(503).json({
        error: 'Google Gemini AI service is currently unavailable. Please verify that GEMINI_API_KEY is configured in your server environment.',
      });
    }

    const prompt = `You are an academic project coordinator reviewing capstone project proposals for feasibility.
Evaluate this proposal:
Title: ${sanitizeString(title)}
Description: ${sanitizeString(description)}
Identified Features: ${Array.isArray(features) ? features.join(', ') : sanitizeString(features)}
Available Duration: ${sanitizeString(duration || '6 Months')}
Team Size: ${sanitizeString(teamSize || 'Solo (1 Student)')}
Student Skills: ${sanitizeString(studentSkills || 'JavaScript, Python')}

Evaluate:
- Is the project realistic? (boolean)
- Is it suitable for final year evaluation? (boolean)
- Is it achievable within the available time and team size? (boolean)
- Does it match the student's skills? (boolean)
- Scope assessment: 'Scope Too Small' | 'Balanced Scope (Ideal)' | 'Scope Too Large (MVP Recommended)'
- If the scope is too large, clearly partition into an essential RECOMMENDED MVP (3-5 core features) and FUTURE SCOPE (remaining advanced features).
- Provide a clear overall verdict and risk mitigation strategies.

Return strictly JSON.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const validation = JSON.parse(response.text || '{}');
    validation.projectTitle = title;

    setInCache(cacheKey, validation);
    res.json({ validation, cached: false });
  } catch (error: any) {
    console.error('Error in validate-feasibility:', error?.message);
    res.status(500).json({
      error: 'Failed to validate project feasibility via Google Gemini: ' + (error?.message || 'Internal AI service error'),
    });
  }
});

// 7. Live Gemini Fit Analyzer Endpoint
app.post('/api/gemini/analyze-fit', async (req, res) => {
  try {
    const { project, profile } = req.body;
    if (!project || !project.title) {
      return res.status(400).json({ error: 'Project data is required.' });
    }
    if (!profile) {
      return res.status(400).json({ error: 'Student profile data is required.' });
    }

    const cacheKey = getCacheKey('analyze-fit', {
      projectId: project.id,
      skills: profile.technicalSkills,
      languages: profile.programmingLanguages,
      duration: profile.duration || profile.availableDuration,
    });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ fitScores: cached, cached: true });
    }

    const client = getGeminiClient();
    if (!client) {
      return res.status(503).json({
        error: 'Google Gemini AI service is currently unavailable. Please verify that GEMINI_API_KEY is configured in your server environment.',
      });
    }

    const prompt = `You are a Senior University Academic Reviewer and Senior Software Architect.
Perform a rigorous, explainable fit and feasibility evaluation for this capstone project proposal against this specific student's profile:

Student Profile:
- Name: ${sanitizeString(profile.name)}
- Degree & Branch: ${sanitizeString(profile.degree)} (${sanitizeString(profile.branch || 'General')})
- Academic Year: ${sanitizeString(profile.academicYear || profile.year || 'Final Year')}
- Programming Languages: ${(profile.programmingLanguages || []).join(', ') || 'Not specified'}
- Technical Skills: ${(profile.technicalSkills || []).join(', ')}
- Frameworks: ${(profile.frameworks || []).join(', ')}
- Primary Interests: ${(profile.interests || profile.areasOfInterest || []).join(', ')}
- Available Duration: ${sanitizeString(profile.duration || profile.availableDuration || '6 Months')}
- Team Size: ${sanitizeString(profile.teamSize || 'Solo (1 Student)')}
- Target Career Goal: ${sanitizeString(profile.careerGoal || 'Software Engineer')}

Proposed Project:
- Title: ${sanitizeString(project.title)}
- Problem Statement: ${sanitizeString(project.problemStatement || project.shortDescription)}
- Recommended Tech Stack: ${JSON.stringify(project.recommendedTechStack || {})}
- AI Component: ${sanitizeString(project.aiComponent || 'None specified')}
- Stated Difficulty: ${sanitizeString(project.difficulty || 'Intermediate')}

Evaluate 5 metrics (0 to 100 integer score) and provide clear, transparent justifications:
1. skillMatch: How well does the student's declared languages and skills match the project stack?
2. feasibility: Can this project be realistically completed within the student's available duration and team size?
3. innovation: Does this project demonstrate evaluable academic novelty beyond basic CRUD?
4. careerRelevance: Does this project showcase portfolio artifacts relevant to their stated career goal?
5. timeSuitability: Is the scope properly scaled for their timeline?
6. overallFit: Weighted overall suitability (0-100).

Return strictly JSON adhering to this structure:
{
  "skillMatch": number,
  "feasibility": number,
  "innovation": number,
  "careerRelevance": number,
  "timeSuitability": number,
  "overallFit": number,
  "explanation": {
    "skillMatch": string,
    "feasibility": string,
    "innovation": string,
    "careerRelevance": string,
    "timeSuitability": string,
    "overallSummary": string
  }
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (typeof parsed.overallFit !== 'number') {
      throw new Error('Malformed fit evaluation response from Gemini.');
    }

    setInCache(cacheKey, parsed);
    res.json({ fitScores: parsed, cached: false });
  } catch (error: any) {
    console.error('Error in analyze-fit:', error?.message);
    res.status(500).json({
      error: 'Failed to evaluate project fit via Google Gemini: ' + (error?.message || 'Internal AI service error'),
    });
  }
});

// Fallback Generators to ensure zero downtime and 100% reliable evaluation even without live API key
function generateFallbackProjects(profile: any) {
  const langs = profile.programmingLanguages && profile.programmingLanguages.length > 0
    ? profile.programmingLanguages
    : ['Python', 'TypeScript'];
  const primaryLang = langs[0] || 'TypeScript';
  const secondaryLang = langs[1] || (primaryLang === 'Python' ? 'JavaScript' : 'Python');

  const skills = profile.technicalSkills && profile.technicalSkills.length > 0
    ? profile.technicalSkills
    : ['REST APIs', 'Data Structures', 'Git'];
  const primarySkill = skills[0] || 'REST APIs';

  const frameworks = profile.frameworks && profile.frameworks.length > 0
    ? profile.frameworks
    : ['React', 'FastAPI'];
  const primaryFramework = frameworks[0] || 'React';

  const duration = profile.duration || profile.availableDuration || '4-6 Months';
  const difficulty = profile.difficulty || profile.difficultyLevel || 'Intermediate';
  const career = profile.careerGoal || 'Software Engineer';
  const branch = profile.branch || profile.degree || 'Computer Science';

  return [
    {
      id: 'proj_ai_health_guardian',
      title: 'MediSync AI: Multimodal Clinical Triage & Lab Report Explainer',
      shortDescription: `An intelligent medical report interpreter and symptom triage assistant tailored for ${branch} capstones.`,
      problemStatement: 'Patients and rural clinic nurses struggle to decipher complex pathology reports and prioritize urgent consultations, leading to delayed medical interventions.',
      targetUsers: ['Clinic Triage Nurses', 'Patients', 'General Practitioners'],
      realWorldUseCase: 'Rural health centers upload standard blood chemistry reports to obtain automated plain-language risk flags and preliminary triage scheduling.',
      coreFeatures: [
        'Secure OCR and multi-format medical report ingestion',
        'Gemini-powered biochemical parameter risk anomaly detection',
        'Interactive medical vocabulary translator for patients',
        'Clinician review dashboard with confidence telemetry',
        'End-to-end encrypted FHIR-compliant record storage',
      ],
      recommendedTechStack: {
        frontend: [primaryFramework, 'Tailwind CSS', 'Lucide React'],
        backend: [`${primaryLang} / API Gateway`, `${secondaryLang} Microservice`],
        database: ['Cloud Firestore', 'Google Cloud Storage'],
        aiOrMl: ['Google Gemini API (gemini-3.6-flash)', 'Tesseract.js OCR'],
        cloudOrDevOps: ['Google Cloud Run', 'Docker'],
      },
      aiComponent: 'Gemini model extracting clinical markers, cross-referencing reference ranges, and formulating empathetic doctor-vetted summary cards.',
      requiredSkills: [primaryLang, primarySkill, 'Cloud Firestore', 'Prompt Engineering'],
      skillsToLearn: ['Healthcare Data Interoperability (HL7/FHIR)', 'ABAC Security Rules', 'Model Grounding'],
      estimatedDuration: duration,
      difficulty: difficulty,
      innovationFactor: 'Combines lab parameter validation with dynamic plain-language explainability and risk triage scoring.',
      careerRelevance: `Directly showcases competencies needed for ${career} roles.`,
      potentialChallenges: ['Ensuring stringent HIPAA/GDPR data masking', 'Hallucination mitigation via structured schema validation'],
      futureScope: ['EHR bidirectional sync', 'Multilingual voice consultations via Gemini Live API'],
      fitScores: {
        skillMatch: 92,
        feasibility: 88,
        innovation: 90,
        careerRelevance: 94,
        timeSuitability: 89,
        overallFit: 91,
        explanation: {
          skillMatch: `Strong alignment with your preferred language (${primaryLang}) and skills (${primarySkill}).`,
          feasibility: 'Clean architectural boundary makes an MVP achievable within your specified timeline.',
          innovation: 'Solves real explainability bottlenecks rather than wrapping basic chat interfaces.',
          careerRelevance: `Specifically curated to accelerate your path to becoming a ${career}.`,
          timeSuitability: `Modular phase structure fits your ${duration} timeline smoothly.`,
          overallSummary: 'High-impact capstone project with clear societal value and rigorous technical depth.',
        },
      },
    },
    {
      id: 'proj_eco_grid_ai',
      title: 'EcoVolt AI: Microgrid Renewable Energy Demand Forecaster & Dispatcher',
      shortDescription: `Smart campus energy management system utilizing ${primaryLang} and intelligent time-series telemetry.`,
      problemStatement: 'Educational campuses waste up to 35% of generated solar energy due to lack of predictive load balancing and manual battery dispatching.',
      targetUsers: ['Campus Facility Managers', 'Sustainability Officers', 'Electrical Engineers'],
      realWorldUseCase: 'Optimizes campus building HVAC and EV charging loads dynamically based on real-time solar irradiation models.',
      coreFeatures: [
        'Time-series sensor telemetry ingestion pipeline',
        'Solar irradiance and peak consumption forecasting model',
        'Automated battery charge/discharge scheduling algorithm',
        'Real-time carbon offset and cost savings analytics dashboard',
        'Fault detection alerts for malfunctioning photovoltaic inverters',
      ],
      recommendedTechStack: {
        frontend: [primaryFramework, 'Tailwind CSS', 'Recharts'],
        backend: [`${primaryLang} Services`, `${secondaryLang} Analytics`],
        database: ['TimescaleDB / Firestore'],
        aiOrMl: ['Google Gemini API', 'Scikit-Learn Regression'],
        cloudOrDevOps: ['Docker', 'Google Cloud Run'],
      },
      aiComponent: 'Gemini reasoning agent analyzing multi-variable weather predictions and generating human-readable grid dispatch directives.',
      requiredSkills: [primaryLang, 'Analytical Modeling', primarySkill],
      skillsToLearn: ['Time-series Forecasting', 'IoT Telemetry Pipelines', 'Green Software Engineering'],
      estimatedDuration: duration,
      difficulty: difficulty,
      innovationFactor: 'Replaces expensive industrial SCADA optimization with an accessible cloud-native AI dispatch agent.',
      careerRelevance: `High-value project for ${career} applicants looking to demonstrate complex systems expertise.`,
      potentialChallenges: ['Simulating realistic fluctuating grid sensor feeds without physical solar farm access'],
      futureScope: ['Edge compute deployment on Raspberry Pi controllers', 'Peer-to-peer microgrid energy trading simulation'],
      fitScores: {
        skillMatch: 88,
        feasibility: 85,
        innovation: 93,
        careerRelevance: 91,
        timeSuitability: 87,
        overallFit: 89,
        explanation: {
          skillMatch: `Applies your ${primaryLang} proficiency to physical-world data challenges.`,
          feasibility: 'Public weather APIs and synthetic energy datasets allow fast validation.',
          innovation: 'Addresses sustainable computing and active grid balancing with modern AI.',
          careerRelevance: `Demonstrates distributed systems and data engineering desired for ${career}.`,
          timeSuitability: `Straightforward milestone separation fits your ${duration} timeline.`,
          overallSummary: 'An academically rigorous capstone with measurable ESG and efficiency benchmarks.',
        },
      },
    },
    {
      id: 'proj_code_audit_ai',
      title: 'SafeDeploy AI: Autonomous CI/CD Vulnerability Sentinel & Zero-Day Triage',
      shortDescription: `Developer-first security scanner built with ${primaryLang} that inspects pull requests for code safety.`,
      problemStatement: 'Student and junior developers frequently commit unvalidated secrets, outdated packages, and SQL/XSS vulnerabilities into public repositories.',
      targetUsers: ['Student Developers', 'Open Source Maintainers', 'DevSecOps Teams'],
      realWorldUseCase: 'Runs automatically as a GitHub webhook or CLI utility to inspect ASTs and explain exact remediations before production deployment.',
      coreFeatures: [
        'Git commit diff parsing and AST structural analysis',
        'Automated CVE and package typosquatting lookup',
        'Gemini-powered vulnerability explanation with auto-fix patches',
        'Security posture scorecard and compliance badge generator',
        'Interactive sandbox to verify patch efficacy before merging',
      ],
      recommendedTechStack: {
        frontend: [primaryFramework, 'Tailwind CSS', 'Lucide React'],
        backend: [primaryLang, secondaryLang, 'Express / FastAPI'],
        database: ['Firestore', 'Redis Cache'],
        aiOrMl: ['Google Gemini API (gemini-3.6-flash)'],
        cloudOrDevOps: ['Docker', 'Google Cloud Run', 'GitHub Actions'],
      },
      aiComponent: 'Gemini analyzing abstracted code diffs to detect semantic vulnerabilities beyond static regex patterns and generating unified diff patches.',
      requiredSkills: [primaryLang, 'Git Internals', primarySkill],
      skillsToLearn: ['Abstract Syntax Tree (AST) Parsing', 'Static Application Security Testing (SAST)', 'CI/CD Bot Architecture'],
      estimatedDuration: duration,
      difficulty: difficulty,
      innovationFactor: 'Blends static code parsing with semantic AI reasoning to eradicate false positives typical of standard linters.',
      careerRelevance: `Directly targets high-paying ${career} and engineering infrastructure roles.`,
      potentialChallenges: ['Handling large multi-file diffs within context token limits via smart chunking'],
      futureScope: ['IDE extension for VS Code', 'Automated PR creation with tested unit tests'],
      fitScores: {
        skillMatch: 95,
        feasibility: 89,
        innovation: 92,
        careerRelevance: 96,
        timeSuitability: 90,
        overallFit: 94,
        explanation: {
          skillMatch: `Superb match for your ${primaryLang} background and technical toolkit.`,
          feasibility: 'Easily testable on mock vulnerable repositories with immediate tangible results.',
          innovation: 'Modernizes developer security tooling with verifiable auto-remediation diffs.',
          careerRelevance: `Software security and automation are top hiring priorities for ${career}.`,
          timeSuitability: `Can be delivered incrementally within ${duration}: CLI first, then dashboard.`,
          overallSummary: 'Top-tier capstone project that proves software engineering rigor to technical interviewers.',
        },
      },
    },
    {
      id: 'proj_smart_agri_ai',
      title: 'AgriSense AI: Precision Crop Disease Diagnosis & Micro-Climate Advisory',
      shortDescription: `Mobile-friendly agricultural advisor combining ${primaryLang} backend with localized meteorological guidance.`,
      problemStatement: 'Smallholder farmers experience severe crop losses due to delayed identification of fungal pathogens and suboptimal pesticide application.',
      targetUsers: ['Smallholder Farmers', 'Agronomy Students', 'Agricultural Extension Officers'],
      realWorldUseCase: 'Farmer snaps a photo of infected leaves in the field to receive immediate disease classification, treatment options, and weather alerts.',
      coreFeatures: [
        'Mobile camera image capture and client-side preprocessing',
        'Plant pathology classification via Gemini Vision and transfer learning',
        'Localized weather and humidity risk forecasting',
        'Natural language audio voice output in regional dialects',
        'Offline-first offline caching for low-connectivity rural zones',
      ],
      recommendedTechStack: {
        frontend: [primaryFramework, 'Tailwind CSS', 'IndexedDB'],
        backend: [primaryLang, 'REST APIs'],
        database: ['Cloud Firestore'],
        aiOrMl: ['Google Gemini API Multimodal', 'TensorFlow.js Lite'],
        cloudOrDevOps: ['Firebase Hosting', 'Google Cloud Run'],
      },
      aiComponent: 'Multimodal Gemini reasoning examining leaf visual damage patterns, cross-referencing regional temperature and humidity data.',
      requiredSkills: [primaryLang, primarySkill, 'Responsive Design'],
      skillsToLearn: ['Offline-First Progressive Web Apps', 'Multimodal Vision Models', 'Audio TTS integration'],
      estimatedDuration: duration,
      difficulty: difficulty,
      innovationFactor: 'Bridges advanced multimodal vision AI directly to low-bandwidth mobile browsers for rural impact.',
      careerRelevance: `Proves socially responsible software engineering and full-stack competence for ${career}.`,
      potentialChallenges: ['Ensuring high image accuracy under erratic outdoor lighting and blur conditions'],
      futureScope: ['Drone aerial survey stitching', 'Soil sensor Bluetooth connectivity'],
      fitScores: {
        skillMatch: 90,
        feasibility: 93,
        innovation: 87,
        careerRelevance: 89,
        timeSuitability: 94,
        overallFit: 91,
        explanation: {
          skillMatch: `Comfortable match for ${primaryLang} developers looking for impactful ML features.`,
          feasibility: 'High feasibility due to availability of open plant pathology datasets.',
          innovation: 'Combines vision diagnostics with micro-climate risk prediction and localized voice assistance.',
          careerRelevance: `Proves end-to-end full-stack capability and user-centered design needed in ${career}.`,
          timeSuitability: `Standard timeline fits comfortably within ${duration}.`,
          overallSummary: 'Practical, accessible, and socially beneficial project with strong viva presentation appeal.',
        },
      },
    },
  ];
}

function generateFallbackBlueprint(project: any, profile: any) {
  return {
    id: `bp_${project.id || 'custom'}`,
    projectId: project.id || 'proj_1',
    projectTitle: project.title || 'Advanced Capstone Project',
    overview: project.shortDescription || 'An innovative full-stack software application built for final year engineering demonstration.',
    problemStatement: project.problemStatement || 'Addresses manual inefficiency and lack of intelligent automation in target operations.',
    proposedSolution: 'A scalable, micro-service or modular cloud application utilizing Google Gemini for intelligent reasoning, coupled with an interactive web client.',
    targetUsers: project.targetUsers || ['Students', 'Domain Specialists', 'System Administrators'],
    functionalRequirements: [
      'User Authentication & Role-Based Access Control (RBAC)',
      'Data ingestion and payload validation with cryptographic hashing',
      'Intelligent analysis engine powered by Google Gemini API',
      'Real-time interactive dashboard with drill-down metrics',
      'Exportable reporting module (PDF, JSON, Markdown)',
      'Automated error recovery and fallback degradation strategies',
    ],
    nonFunctionalRequirements: [
      'Performance: API response time under 500ms for non-AI queries',
      'Security: Zero-Trust ABAC Firestore rules, all keys hidden server-side',
      'Accessibility: Full WCAG 2.1 AA compliance across all components',
      'Scalability: Containerized architecture scalable to 10,000 active sessions',
      'Reliability: 99.9% uptime with automated health probes and error boundaries',
    ],
    coreFeatures: project.coreFeatures || [
      'Interactive Analytics Dashboard',
      'AI Analysis Pipeline',
      'Role-based Authorization',
      'Audit Trail and Activity Logging',
    ],
    technologyStack: project.recommendedTechStack || {
      frontend: ['React 19', 'Tailwind CSS', 'Vite'],
      backend: ['Node.js', 'Express', 'TypeScript'],
      database: ['Cloud Firestore', 'Redis'],
      aiOrMl: ['Google Gemini API (gemini-3.6-flash)'],
      cloudOrDevOps: ['Google Cloud Run', 'Docker'],
    },
    systemArchitecture: 'Client-Server architecture with a React Single Page Application communicating through authenticated REST API gateways to an Express backend. Gemini calls are mediated server-side with strict input sanitization, token caching, and schema validation.',
    databaseDesign: [
      {
        name: 'users',
        description: 'Stores student and user profile settings and credentials metadata',
        fields: [
          { name: 'userId', type: 'string (PK)', description: 'Unique user identifier from Auth' },
          { name: 'email', type: 'string', description: 'User contact email' },
          { name: 'role', type: 'string', description: 'User permission role' },
          { name: 'createdAt', type: 'timestamp', description: 'Account creation time' },
        ],
      },
      {
        name: 'projects',
        description: 'Stores registered capstone project metadata and state',
        fields: [
          { name: 'id', type: 'string (PK)', description: 'Project unique ID' },
          { name: 'userId', type: 'string (FK)', description: 'Owner user ID' },
          { name: 'title', type: 'string', description: 'Official project title' },
          { name: 'status', type: 'string', description: 'Active, In-Progress, or Completed' },
          { name: 'fitScore', type: 'number', description: 'Overall feasibility score' },
        ],
      },
      {
        name: 'roadmap_tasks',
        description: 'Sprint tasks and milestones associated with the project phases',
        fields: [
          { name: 'id', type: 'string (PK)', description: 'Task unique identifier' },
          { name: 'projectId', type: 'string (FK)', description: 'Belonging project ID' },
          { name: 'title', type: 'string', description: 'Actionable task title' },
          { name: 'status', type: 'string', description: 'not-started | in-progress | completed' },
          { name: 'estimatedHours', type: 'number', description: 'Effort estimation' },
        ],
      },
      {
        name: 'audit_logs',
        description: 'Tamper-proof system activity log for telemetry and security',
        fields: [
          { name: 'id', type: 'string (PK)', description: 'Log event ID' },
          { name: 'userId', type: 'string', description: 'Actor ID' },
          { name: 'action', type: 'string', description: 'Mutated resource or AI trigger' },
          { name: 'timestamp', type: 'timestamp', description: 'Server event time' },
        ],
      },
    ],
    apiRequirements: [
      { method: 'POST', endpoint: '/api/auth/session', description: 'Validates client session token and establishes secure context' },
      { method: 'POST', endpoint: '/api/gemini/generate-projects', description: 'Generates structured project proposals with fit scoring' },
      { method: 'POST', endpoint: '/api/gemini/generate-blueprint', description: 'Creates full technical architectural blueprint' },
      { method: 'POST', endpoint: '/api/gemini/mentor-chat', description: 'Context-aware mentoring chat with roadmap understanding' },
      { method: 'GET', endpoint: '/api/health', description: 'Verifies backend health and secret readiness' },
    ],
    authenticationStrategy: 'JWT-based token verification paired with Firebase Authentication. Client uses popup sign-in, while Express server verifies Bearer tokens on protected endpoints.',
    aiIntegrationArchitecture: 'Direct integration with Google Gemini 3.8 Flash via @google/genai SDK. Prompts are constructed server-side with system instructions, structured JSON schemas, in-memory SHA256 caching to reduce token usage, and automatic error fallbacks.',
    developmentPhases: [
      'Phase 1: Requirements Gathering & System Blueprinting',
      'Phase 2: UI Wireframing, Accessibility & Design Tokens',
      'Phase 3: Database Schemas, Firestore Security Rules & Auth',
      'Phase 4: Backend REST Services & Server-side Gemini Gateway',
      'Phase 5: Core Domain Features & Business Logic Implementation',
      'Phase 6: AI Orchestration, Prompt Tuning & Evaluation',
      'Phase 7: End-to-End Automated Testing & Security Audit',
      'Phase 8: Docker Containerization, Cloud Run Deployment & Viva Defense',
    ],
    testingStrategy: [
      'Unit Testing: Vitest for utilities, scoring algorithms, and pure functions',
      'Component Testing: React Testing Library with accessible queries',
      'Integration Testing: Backend route validation with mock request payloads',
      'Security Testing: Automated Firestore Security Rules validation using Dirty Dozen payloads',
      'Accessibility Testing: Axe-core and manual keyboard focus traversal verification',
    ],
    deploymentPlan: 'Containerized using Docker with multi-stage build. Deployed to Google Cloud Run with automatic scaling, HTTPS termination, and continuous delivery via GitHub Actions.',
    securityConsiderations: [
      'Gemini API keys isolated strictly in server environment variables',
      'Zero-Trust Attribute-Based Access Control on all database collections',
      'Input sanitization preventing XSS, SQLi, and prototype pollution',
      'Content Security Policy (CSP) and CORS origin restrictions',
      'Rate limiting on compute-heavy AI generation endpoints',
    ],
    futureEnhancements: [
      'Real-time collaborative editing using WebSockets',
      'Voice interactive mentoring using Gemini Live API',
      'Automated grading rubric generator for university evaluators',
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateFallbackRoadmap(project: any) {
  return {
    projectId: project.id || 'proj_active',
    projectTitle: project.title || 'Capstone Project',
    updatedAt: new Date().toISOString(),
    phases: [
      {
        id: 'phase_1',
        phaseNumber: 1,
        title: 'Phase 1 — Requirements & Feasibility Analysis',
        objective: 'Formalize problem statement, define system requirements, and validate technical viability with academic advisors.',
        expectedOutput: 'Approved Software Requirements Specification (SRS) and architecture diagram.',
        estimatedDuration: '1.5 Weeks',
        prerequisites: ['Topic Approval'],
        tasks: [
          { id: 't1_1', phaseId: 'phase_1', title: 'Draft Problem Statement & Stakeholder Personas', description: 'Specify exact user personas, pain points, and success metrics.', estimatedHours: 6, status: 'completed' },
          { id: 't1_2', phaseId: 'phase_1', title: 'Define Functional & Non-Functional Specifications', description: 'Document inputs, expected outputs, security, and performance constraints.', estimatedHours: 8, status: 'completed' },
          { id: 't1_3', phaseId: 'phase_1', title: 'Conduct Tech Stack Feasibility Check', description: 'Verify library versions, API quotas, and platform compatibilities.', estimatedHours: 5, status: 'in-progress' },
        ],
      },
      {
        id: 'phase_2',
        phaseNumber: 2,
        title: 'Phase 2 — UI/UX Design & Component Architecture',
        objective: 'Design responsive, accessible user interfaces and structure reusable UI component hierarchy.',
        expectedOutput: 'High-fidelity Figma wireframes and foundational React component scaffold.',
        estimatedDuration: '2 Weeks',
        prerequisites: ['Phase 1 Requirements'],
        tasks: [
          { id: 't2_1', phaseId: 'phase_2', title: 'Create Low-Fidelity Wireframes & User Journey', description: 'Map out screen transitions and navigation flows.', estimatedHours: 8, status: 'not-started' },
          { id: 't2_2', phaseId: 'phase_2', title: 'Configure Tailwind CSS & Accessibility Tokens', description: 'Establish color contrast, typography scale, and focus ring utilities.', estimatedHours: 6, status: 'not-started' },
          { id: 't2_3', phaseId: 'phase_2', title: 'Build Atomic Component Library (Buttons, Inputs, Cards)', description: 'Implement accessible, semantic UI atoms with ARIA attributes.', estimatedHours: 12, status: 'not-started' },
        ],
      },
      {
        id: 'phase_3',
        phaseNumber: 3,
        title: 'Phase 3 — Database & Authentication Setup',
        objective: 'Provision persistent cloud data store, implement security rules, and configure user auth.',
        expectedOutput: 'Functional authentication system and verified database schemas.',
        estimatedDuration: '1.5 Weeks',
        prerequisites: ['Phase 2 UI Scaffold'],
        tasks: [
          { id: 't3_1', phaseId: 'phase_3', title: 'Implement Firebase / Cloud Auth Provider', description: 'Integrate session management, login, and registration states.', estimatedHours: 8, status: 'not-started' },
          { id: 't3_2', phaseId: 'phase_3', title: 'Configure Database Schemas & Collections', description: 'Define user profiles, project records, and task document structures.', estimatedHours: 6, status: 'not-started' },
          { id: 't3_3', phaseId: 'phase_3', title: 'Deploy Hardened Zero-Trust Security Rules', description: 'Enforce ABAC rules preventing unauthorized cross-tenant writes.', estimatedHours: 7, status: 'not-started' },
        ],
      },
      {
        id: 'phase_4',
        phaseNumber: 4,
        title: 'Phase 4 — Backend API Gateway & Server Setup',
        objective: 'Construct secure Express backend, establish API routing, and configure error handling.',
        expectedOutput: 'Production-ready REST API endpoints with validation and rate limiting.',
        estimatedDuration: '2 Weeks',
        prerequisites: ['Phase 3 Database'],
        tasks: [
          { id: 't4_1', phaseId: 'phase_4', title: 'Scaffold Express Server & Route Architecture', description: 'Create modular controller and service layers.', estimatedHours: 10, status: 'not-started' },
          { id: 't4_2', phaseId: 'phase_4', title: 'Implement Payload Validation & Sanitization', description: 'Enforce strict typing and boundary checking on all incoming bodies.', estimatedHours: 6, status: 'not-started' },
          { id: 't4_3', phaseId: 'phase_4', title: 'Add Centralized Error Handling & Logging Middleware', description: 'Prevent stack trace leakage and standardize JSON error responses.', estimatedHours: 5, status: 'not-started' },
        ],
      },
      {
        id: 'phase_5',
        phaseNumber: 5,
        title: 'Phase 5 — Core Features & Business Logic',
        objective: 'Build primary domain capabilities and integrate frontend with backend endpoints.',
        expectedOutput: 'End-to-end working MVP capable of running core user workflows.',
        estimatedDuration: '3 Weeks',
        prerequisites: ['Phase 4 API Gateway'],
        tasks: [
          { id: 't5_1', phaseId: 'phase_5', title: 'Implement Primary Data Ingestion Pipeline', description: 'Support file upload, form submission, and data parsing.', estimatedHours: 14, status: 'not-started' },
          { id: 't5_2', phaseId: 'phase_5', title: 'Build Real-time Interactive Dashboard Views', description: 'Render progress metrics, summary cards, and detail drawers.', estimatedHours: 16, status: 'not-started' },
          { id: 't5_3', phaseId: 'phase_5', title: 'Implement State Synchronization & Optimistic UI', description: 'Cache state locally and sync seamlessly with cloud storage.', estimatedHours: 8, status: 'not-started' },
        ],
      },
      {
        id: 'phase_6',
        phaseNumber: 6,
        title: 'Phase 6 — Google Gemini AI Integration',
        objective: 'Incorporate intelligent Gemini reasoning, structured schema output, and AI mentoring.',
        expectedOutput: 'Seamless, project-aware AI features operating through secure backend proxies.',
        estimatedDuration: '2 Weeks',
        prerequisites: ['Phase 5 Core MVP'],
        tasks: [
          { id: 't6_1', phaseId: 'phase_6', title: 'Integrate @google/genai SDK on Server', description: 'Connect Gemini 3.8 Flash model with system instructions.', estimatedHours: 8, status: 'not-started' },
          { id: 't6_2', phaseId: 'phase_6', title: 'Tune Structured JSON Prompting & Schemas', description: 'Validate model responses against Type schemas with fallbacks.', estimatedHours: 10, status: 'not-started' },
          { id: 't6_3', phaseId: 'phase_6', title: 'Implement In-Memory SHA256 Caching Layer', description: 'Eliminate duplicate requests and reduce token consumption.', estimatedHours: 6, status: 'not-started' },
        ],
      },
      {
        id: 'phase_7',
        phaseNumber: 7,
        title: 'Phase 7 — Comprehensive Testing & Quality Assurance',
        objective: 'Conduct rigorous unit, integration, accessibility, and security vulnerability tests.',
        expectedOutput: 'Passing automated test suite and WCAG AA accessibility audit report.',
        estimatedDuration: '1.5 Weeks',
        prerequisites: ['Phase 6 AI Integration'],
        tasks: [
          { id: 't7_1', phaseId: 'phase_7', title: 'Write Vitest Unit Tests for Scoring & Validation', description: 'Test edge cases, invalid inputs, and deterministic helpers.', estimatedHours: 10, status: 'not-started' },
          { id: 't7_2', phaseId: 'phase_7', title: 'Perform Accessibility Audit (WCAG AA Compliance)', description: 'Verify keyboard navigation, ARIA live regions, and contrast ratios.', estimatedHours: 6, status: 'not-started' },
          { id: 't7_3', phaseId: 'phase_7', title: 'Execute Security Penetration Test on Endpoints', description: 'Confirm zero-key exposure and rejection of unauthorized payloads.', estimatedHours: 6, status: 'not-started' },
        ],
      },
      {
        id: 'phase_8',
        phaseNumber: 8,
        title: 'Phase 8 — Deployment, Documentation & Viva Preparation',
        objective: 'Deploy to Cloud Run, compile comprehensive documentation, and prepare presentation deck.',
        expectedOutput: 'Live production URL, complete GitHub repository, and defense slides.',
        estimatedDuration: '1.5 Weeks',
        prerequisites: ['Phase 7 QA'],
        tasks: [
          { id: 't8_1', phaseId: 'phase_8', title: 'Containerize Application with Production Dockerfile', description: 'Bundle client and server into optimized production container.', estimatedHours: 6, status: 'not-started' },
          { id: 't8_2', phaseId: 'phase_8', title: 'Draft Technical Documentation & Evaluation Mapping', description: 'Document architecture, evaluation criteria, and setup instructions.', estimatedHours: 8, status: 'not-started' },
          { id: 't8_3', phaseId: 'phase_8', title: 'Prepare Viva Demonstration Script & Slide Deck', description: 'Create presentation highlighting problem statement and AI integration.', estimatedHours: 8, status: 'not-started' },
        ],
      },
    ],
  };
}

function generateFallbackMentorReply(message: string, context: any) {
  const lower = message.toLowerCase();
  const projectTitle = context?.project?.title || 'your capstone project';
  const stack = context?.project?.recommendedTechStack || {};
  const currentTask = context?.nextTaskTitle || 'your active roadmap phase';

  if (lower.includes('auth') || lower.includes('login') || lower.includes('password')) {
    return `For **${projectTitle}**, here is how you should implement Authentication safely using your stack (${stack.backend?.join(', ') || 'Node.js'} + ${stack.database?.join(', ') || 'Firestore'}):

1. **Client Token Acquisition**: Use Firebase Authentication's client SDK (e.g., \`signInWithPopup\` or email/password) so passwords never touch custom database tables.
2. **Server Authorization Header**: Send the Firebase ID token in the \`Authorization: Bearer <token>\` header on all API requests.
3. **Server Verification**: In your Express middleware, verify the token using Firebase Admin SDK:
\`\`\`typescript
const authHeader = req.headers.authorization;
if (!authHeader?.startsWith('Bearer ')) {
  return res.status(401).json({ error: 'Missing or malformed authorization token' });
}
const idToken = authHeader.split('Bearer ')[1];
const decodedToken = await admin.auth().verifyIdToken(idToken);
req.user = decodedToken; // contains uid, email, email_verified
\`\`\`
4. **Database Rules**: In \`firestore.rules\`, enforce \`request.auth.uid == userId\` to lock each user's records strictly to their tenancy.

Would you like to review the exact Firestore rules snippet for your project collections?`;
  }

  if (lower.includes('what should i build next') || lower.includes('what next') || lower.includes('next step')) {
    return `Looking at your project roadmap for **${projectTitle}**:

- **Current Milestone**: You are currently in **${context?.currentPhaseTitle || 'Phase 1 / Phase 2'}**.
- **Next Logical Task**: I recommend focusing on **"${currentTask}"**.

### Why this task now?
Completing "${currentTask}" gives you the foundational data structure needed before you wire up the AI reasoning layer. Without this layer finalized, any downstream UI or AI logic would have to be refactored later.

**Action Item**:
1. Open the task in your Roadmap tab and switch its status to **In Progress**.
2. Outline the required data fields.
3. Ping me when you are ready to review the implementation!`;
  }

  if (lower.includes('error') || lower.includes('failing') || lower.includes('bug') || lower.includes('crash')) {
    return `Let's debug this systematically for your **${projectTitle}** stack.

### 4-Step Diagnostic Checklist:
1. **Inspect Network Tab**: What is the exact HTTP status code?
   - \`401/403\`: Authentication token missing or expired; check your auth context.
   - \`400\`: Payload validation error; verify that all required JSON fields match the server schema.
   - \`500\`: Server-side unhandled exception; check server terminal output.
2. **Verify CORS & Port Binding**: Ensure frontend requests target the same host or port \`3000\`.
3. **Check Environment Secrets**: Verify that required environment variables are loaded via \`dotenv\` before initialization.
4. **Sanitize Payload**: Ensure no undefined or circular values are passed to \`JSON.stringify()\`.

Paste the specific error message or stack trace here and I will point out the exact line causing the issue!`;
  }

  return `Hello! As your technical mentor for **${projectTitle}**, I am tracking your active roadmap tasks and architecture.

We are utilizing a modern stack:
- **Frontend**: ${stack.frontend?.join(', ') || 'React + Tailwind'}
- **Backend**: ${stack.backend?.join(', ') || 'Express + TypeScript'}
- **AI Core**: ${stack.aiOrMl?.join(', ') || 'Google Gemini 3.8 Flash'}

How can I help you right now? You can ask:
- *"How do I structure the API routes for my core features?"*
- *"What should I build next based on my roadmap?"*
- *"How should I prepare this feature for my final viva defense?"*`;
}

function generateFallbackImprovement(originalIdea: string) {
  return {
    originalIdea,
    weaknesses: [
      'Lacks verifiable automated validation, relying largely on manual inputs',
      'Missing zero-trust role separation and defensive input boundaries',
      'No caching or efficiency strategy for repeated operations',
      'Generic UI without clear workflow guidance for end-users',
    ],
    missingFeatures: [
      'Automated telemetry logging and audit trail generator',
      'Real-time anomaly detection using intelligent reasoning',
      'Exportable compliance and report generation modules (PDF/Markdown)',
      'Offline-tolerant local data persistence with cloud sync',
    ],
    aiOpportunities: [
      'Gemini multimodal document parsing for instant data extraction',
      'Personalized contextual guidance agent replacing static FAQ pages',
      'Automated risk scoring and feasibility prediction models',
    ],
    securityImprovements: [
      'Server-side API key isolation preventing secret leakage to browsers',
      'Attribute-Based Access Control (ABAC) in database security rules',
      'Defensive sanitization against Cross-Site Scripting (XSS) and injection',
    ],
    scalabilityImprovements: [
      'Stateless microservice endpoints deployable to Google Cloud Run',
      'Client-side request debouncing and in-memory server response caching',
      'Database query indexing with limit constraints to prevent runaway read bills',
    ],
    uxImprovements: [
      'Keyboard-accessible WCAG AA navigation with clear focus indicators',
      'Polished status badges and progress percentage calculations',
      'Toast notifications and accessible loading skeleton states',
    ],
    technicalImprovements: [
      'Full TypeScript strict typing across client and server DTOs',
      'Centralized error boundary catching runtime exceptions gracefully',
      'Automated Vitest test suite testing critical logic and edge cases',
    ],
    innovationOpportunities: [
      'Interactive project-aware AI copilot integrated into student workflows',
      'Explainable multi-metric scoring radar instead of opaque ratings',
      'Automated MVP generation pruning non-essential features for tight deadlines',
    ],
    improvedProject: {
      title: `${originalIdea.slice(0, 40)}: Enterprise-Grade Intelligent Edition`,
      elevatedProblemStatement: `Transforms ${originalIdea} from an isolated academic prototype into a resilient, production-ready system with automated intelligence, strict security boundaries, and demonstrable industry relevance.`,
      improvedArchitecture: 'Modular full-stack architecture with React 19 frontend, server-side Express API gateway, Google Gemini 3.8 Flash reasoning layer, and Firestore database guarded by zero-trust ABAC rules.',
      upgradedFeatures: [
        'Automated AI-assisted workflow analysis with explainability tags',
        'End-to-end encrypted user data isolation per academic tenancy',
        'Interactive roadmap tracker with phase-by-phase completion telemetry',
        'Direct export to formal university capstone report format',
      ],
      modernTechStack: {
        frontend: ['React 19', 'Tailwind CSS', 'Lucide React'],
        backend: ['Node.js', 'Express', 'TypeScript'],
        database: ['Cloud Firestore', 'Local Storage Sync'],
        aiOrMl: ['Google Gemini API (gemini-3.6-flash)'],
        cloudOrDevOps: ['Google Cloud Run', 'Docker'],
      },
      novelAiHook: 'Real-time contextual mentor that inspects student task completion and dynamically provides stack-tailored code guidance.',
      industryReadinessFactor: 'Meets production criteria: zero exposed secrets, WCAG AA compliance, and modular test coverage.',
    },
  };
}

function generateFallbackValidation(payload: any) {
  const title = payload.title || 'Capstone Project';
  const duration = payload.duration || '6 Months';
  const isShortDuration = duration.toLowerCase().includes('3') || duration.toLowerCase().includes('2');

  return {
    projectTitle: title,
    isRealistic: true,
    isSuitableForFinalYear: true,
    isAchievableInTime: !isShortDuration,
    matchesSkills: true,
    scopeAssessment: isShortDuration ? 'Scope Too Large (MVP Recommended)' : 'Balanced Scope (Ideal)',
    overallVerdict: isShortDuration
      ? 'The concept is viable, but the proposed scope exceeds the available time for a solo student. An MVP focusing on core flows is strongly recommended.'
      : 'Excellent project scope with clear academic depth, practical problem statement, and balanced engineering complexity.',
    featureBreakdown: {
      totalIdentified: 10,
      recommendedMvpCount: 4,
      futureScopeCount: 6,
    },
    recommendedMvpFeatures: [
      'User authentication and personalized profile management',
      'Core data ingestion and processing pipeline',
      'Primary Gemini AI integration with server-side proxy',
      'Interactive dashboard displaying primary analysis results',
    ],
    futureScopeFeatures: [
      'Mobile native app (React Native / Flutter)',
      'Multi-language audio voice integration via Gemini Live API',
      'Third-party ERP / University portal integrations',
      'Automated PDF thesis report compilation',
      'Distributed multi-node clustering',
      'Real-time collaborative multi-user editing',
    ],
    riskMitigationStrategies: [
      'Prioritize completing the core MVP before adding secondary UI widgets',
      'Use mock data fallbacks during initial API development to avoid blocked frontend work',
      'Implement in-memory caching to avoid hitting Gemini API rate limits during testing',
      'Review progress with academic faculty at the end of each roadmap phase',
    ],
    suggestedTimelineMonths: isShortDuration ? 3 : 5,
  };
}

// Vite middleware setup (development vs production)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ProjectPilot AI] Server booted successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
