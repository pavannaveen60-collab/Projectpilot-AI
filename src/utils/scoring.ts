import { StudentProfile, ProjectFitScores } from '../types';

/**
 * Calculates deterministic, explainable fit scores between a student profile and a project idea.
 * Used for both live scoring and offline validation.
 */
export function calculateProjectFit(
  profile: Partial<StudentProfile>,
  project: {
    title: string;
    requiredSkills?: string[];
    difficulty?: string;
    estimatedDuration?: string;
    aiComponent?: string;
    recommendedTechStack?: {
      frontend?: string[];
      backend?: string[];
      database?: string[];
      aiOrMl?: string[];
      cloudOrDevOps?: string[];
    };
  }
): ProjectFitScores {
  const studentSkills = new Set(
    [
      ...(profile.programmingLanguages || []),
      ...(profile.technicalSkills || []),
      ...(profile.frameworks || []),
      ...(profile.preferredTechnologies || []),
    ].map(s => s.toLowerCase().trim())
  );

  const reqSkills = project.requiredSkills || [];
  let matchedSkillsCount = 0;
  reqSkills.forEach(req => {
    const r = req.toLowerCase().trim();
    if (studentSkills.has(r) || Array.from(studentSkills).some(s => s.includes(r) || r.includes(s))) {
      matchedSkillsCount++;
    }
  });

  // 1. Skill Match: Based on ratio of known skills vs required
  const skillRatio = reqSkills.length > 0 ? matchedSkillsCount / reqSkills.length : 0.75;
  const skillMatch = Math.min(98, Math.max(60, Math.round(65 + skillRatio * 32)));

  // 2. Feasibility: Compares difficulty & team size
  let feasibility = 85;
  const diff = (project.difficulty || profile.difficultyLevel || 'Intermediate').toLowerCase();
  const team = (profile.teamSize || 'Solo (1 Student)').toLowerCase();
  if (diff.includes('advanced') || diff.includes('research')) {
    feasibility -= team.includes('solo') ? 10 : 3;
  } else if (diff.includes('beginner')) {
    feasibility += 7;
  }
  feasibility = Math.min(96, Math.max(62, feasibility));

  // 3. Innovation: Boosted if intelligent AI/multimodal elements are present
  let innovation = 84;
  if (project.aiComponent && project.aiComponent.length > 20) {
    innovation += 8;
  }
  if (project.title.toLowerCase().includes('multi') || project.title.toLowerCase().includes('smart')) {
    innovation += 3;
  }
  innovation = Math.min(97, Math.max(70, innovation));

  // 4. Career Relevance: Matches student's career goal or preferred domain
  let careerRelevance = 88;
  const careerGoal = (profile.careerGoal || '').toLowerCase();
  const domain = (profile.preferredDomain || '').toLowerCase();
  if (careerGoal && (project.title.toLowerCase().includes(careerGoal) || domain.includes(careerGoal))) {
    careerRelevance += 6;
  }
  careerRelevance = Math.min(98, Math.max(72, careerRelevance));

  // 5. Time Suitability: Evaluates duration feasibility
  let timeSuitability = 89;
  const availDuration = (profile.availableDuration || '6 Months').toLowerCase();
  if (availDuration.includes('3') && (diff.includes('advanced') || diff.includes('research'))) {
    timeSuitability -= 12;
  } else if (availDuration.includes('year') || availDuration.includes('6')) {
    timeSuitability += 5;
  }
  timeSuitability = Math.min(98, Math.max(65, timeSuitability));

  // Weighted Overall Fit
  const overallFit = Math.round(
    skillMatch * 0.3 +
    feasibility * 0.25 +
    careerRelevance * 0.2 +
    timeSuitability * 0.15 +
    innovation * 0.1
  );

  const explanation = {
    skillMatch: `You currently match ${matchedSkillsCount} of ${reqSkills.length || 4} primary competencies, ensuring you can build the core without being blocked.`,
    feasibility: `Given your ${profile.teamSize || 'team configuration'}, the architectural complexity is well within reach for an academic semester.`,
    innovation: `Incorporate clear AI automation rather than basic CRUD patterns, scoring high in evaluator novelty rubrics.`,
    careerRelevance: `Directly aligns with your goal of becoming a ${profile.careerGoal || 'Software Engineer'}, providing strong interview talking points.`,
    timeSuitability: `The modular phase milestones comfortably fit into your ${profile.availableDuration || 'available timeline'}.`,
    overallSummary: `An overall fit of ${overallFit}% indicates high potential for both academic evaluation success and practical portfolio depth.`,
  };

  return {
    skillMatch,
    feasibility,
    innovation,
    careerRelevance,
    timeSuitability,
    overallFit,
    explanation,
  };
}
