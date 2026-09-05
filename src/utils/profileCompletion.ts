import { StudentProfile } from '../types';

export interface FieldCheck {
  id: string;
  label: string;
  required: boolean;
  isFilled: boolean;
  valueDescription?: string;
}

export interface ProfileCompletionResult {
  percentage: number;
  isMinimallyComplete: boolean;
  isFullyComplete: boolean;
  canGenerateIdeas: boolean;
  missingRequired: string[];
  missingOptional: string[];
  completedFieldsCount: number;
  totalFieldsCount: number;
  fields: FieldCheck[];
}

/**
 * Evaluates the completion level of a Student Profile.
 * Ensures that AI idea generation is only unlocked once minimum academic
 * and skill parameters are explicitly collected from the user.
 */
export function calculateProfileCompletion(profile?: Partial<StudentProfile> | null): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      isMinimallyComplete: false,
      isFullyComplete: false,
      canGenerateIdeas: false,
      missingRequired: [
        'Full Name',
        'Degree',
        'Branch / Specialization',
        'Academic Year',
        'Programming Languages or Technical Skills',
        'Areas of Interest',
        'Current Skill Level',
        'Available Project Duration',
        'Career Goal',
      ],
      missingOptional: [
        'Preferred Project Domains',
        'Project Difficulty Preference',
        'Team Size',
        'Frameworks / Libraries',
        'Preferred Tech Stack',
      ],
      completedFieldsCount: 0,
      totalFieldsCount: 14,
      fields: [],
    };
  }

  const hasName = Boolean(profile.name && profile.name.trim().length >= 2);
  const hasDegree = Boolean(profile.degree && profile.degree.trim().length > 0);
  const hasBranch = Boolean(profile.branch && profile.branch.trim().length > 0);
  const hasYear = Boolean((profile.year && profile.year.trim().length > 0) || (profile.academicYear && profile.academicYear.trim().length > 0));
  
  const progLangs = profile.programmingLanguages || [];
  const techSkills = profile.technicalSkills || [];
  const hasSkillsOrLangs = Boolean((progLangs.length > 0 && progLangs.some(l => l.trim().length > 0)) ||
    (techSkills.length > 0 && techSkills.some(s => s.trim().length > 0)));

  const interests = profile.interests || profile.areasOfInterest || profile.primaryInterests || [];
  const hasInterests = Boolean(interests.length > 0 && interests.some(i => i.trim().length > 0));

  const hasSkillLevel = Boolean((profile.skillLevel && profile.skillLevel.trim().length > 0) ||
    (profile.difficultyLevel && profile.difficultyLevel.trim().length > 0));

  const hasDuration = Boolean((profile.duration && profile.duration.trim().length > 0) ||
    (profile.availableDuration && profile.availableDuration.trim().length > 0));

  const hasCareerGoal = Boolean(profile.careerGoal && profile.careerGoal.trim().length >= 2);

  // Optional / Recommended fields
  const domains = profile.preferredDomains || (profile.preferredDomain ? [profile.preferredDomain] : []);
  const hasDomains = Boolean(domains.length > 0 && domains.some(d => d.trim().length > 0));

  const hasDifficulty = Boolean((profile.difficulty && profile.difficulty.trim().length > 0) ||
    (profile.difficultyLevel && profile.difficultyLevel.trim().length > 0));

  const hasTeamSize = Boolean(profile.teamSize && profile.teamSize.trim().length > 0);

  const frameworks = profile.frameworks || [];
  const hasFrameworks = Boolean(frameworks.length > 0 && frameworks.some(f => f.trim().length > 0));

  const preferredStack = profile.preferredStack || profile.preferredTechnologies || [];
  const hasPreferredStack = Boolean(preferredStack.length > 0 && preferredStack.some(p => p.trim().length > 0));

  const fields: FieldCheck[] = [
    { id: 'name', label: 'Full Name', required: true, isFilled: hasName },
    { id: 'degree', label: 'Degree', required: true, isFilled: hasDegree },
    { id: 'branch', label: 'Branch / Specialization', required: true, isFilled: hasBranch },
    { id: 'year', label: 'Academic Year', required: true, isFilled: hasYear },
    { id: 'skills', label: 'Programming Languages or Technical Skills', required: true, isFilled: hasSkillsOrLangs },
    { id: 'interests', label: 'Areas of Interest', required: true, isFilled: hasInterests },
    { id: 'skillLevel', label: 'Current Skill Level', required: true, isFilled: hasSkillLevel },
    { id: 'duration', label: 'Available Project Duration', required: true, isFilled: hasDuration },
    { id: 'careerGoal', label: 'Career Goal', required: true, isFilled: hasCareerGoal },
    // Optional
    { id: 'domains', label: 'Preferred Project Domains', required: false, isFilled: hasDomains },
    { id: 'difficulty', label: 'Project Difficulty Preference', required: false, isFilled: hasDifficulty },
    { id: 'teamSize', label: 'Team Size', required: false, isFilled: hasTeamSize },
    { id: 'frameworks', label: 'Frameworks / Libraries', required: false, isFilled: hasFrameworks },
    { id: 'preferredStack', label: 'Preferred Tech Stack', required: false, isFilled: hasPreferredStack },
  ];

  const requiredFields = fields.filter(f => f.required);
  const optionalFields = fields.filter(f => !f.required);

  const missingRequired = requiredFields.filter(f => !f.isFilled).map(f => f.label);
  const missingOptional = optionalFields.filter(f => !f.isFilled).map(f => f.label);

  const filledCount = fields.filter(f => f.isFilled).length;
  const isMinimallyComplete = missingRequired.length === 0;
  const isFullyComplete = filledCount === fields.length;

  // Weighted score: required fields account for 75% of progress, optional fields account for 25%
  const requiredRatio = (requiredFields.length - missingRequired.length) / requiredFields.length;
  const optionalRatio = (optionalFields.length - missingOptional.length) / optionalFields.length;
  const percentage = Math.min(100, Math.round(requiredRatio * 75 + optionalRatio * 25));

  return {
    percentage,
    isMinimallyComplete,
    isFullyComplete,
    canGenerateIdeas: isMinimallyComplete,
    missingRequired,
    missingOptional,
    completedFieldsCount: filledCount,
    totalFieldsCount: fields.length,
    fields,
  };
}
