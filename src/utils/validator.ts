import { StudentProfile } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateStudentProfile(profile: Partial<StudentProfile>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!profile.name || profile.name.trim().length < 2) {
    errors.name = 'Full name is required (minimum 2 characters).';
  } else if (profile.name.length > 100) {
    errors.name = 'Name must not exceed 100 characters.';
  }

  if (profile.email !== undefined && profile.email !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email.trim())) {
      errors.email = 'A valid college/personal email address is required.';
    }
  }

  if (!profile.degree || profile.degree.trim().length < 2) {
    errors.degree = 'Degree / Program of study is required.';
  }

  const hasYear = Boolean((profile.year && profile.year.trim().length > 0) || (profile.academicYear && profile.academicYear.trim().length > 0));
  if (!hasYear) {
    errors.academicYear = 'Please select your current academic year.';
  }

  const progLangs = profile.programmingLanguages || [];
  const techSkills = profile.technicalSkills || [];
  const totalSkillsCount = progLangs.filter(l => l.trim().length > 0).length + techSkills.filter(s => s.trim().length > 0).length;

  if (profile.technicalSkills !== undefined && (!profile.technicalSkills || profile.technicalSkills.length === 0) && progLangs.length === 0) {
    errors.technicalSkills = 'Please provide at least one programming language or technical competency.';
  } else if (totalSkillsCount === 0) {
    errors.technicalSkills = 'Please select at least one programming language or technical skill.';
  }

  if (profile.branch !== undefined && profile.branch.trim().length === 0) {
    errors.branch = 'Branch / Specialization is required.';
  }

  if (profile.careerGoal !== undefined && profile.careerGoal.trim().length < 2) {
    errors.careerGoal = 'Please specify your target career goal.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateProjectProposal(proposal: {
  title?: string;
  description?: string;
  duration?: string;
  teamSize?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!proposal.title || proposal.title.trim().length < 3) {
    errors.title = 'Project title is required (minimum 3 characters).';
  }

  if (!proposal.description || proposal.description.trim().length < 10) {
    errors.description = 'Please provide a descriptive problem or proposal summary (minimum 10 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeString(value: string, maxLen = 1000): string {
  if (!value) return '';
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip scripts
    .replace(/javascript:/gi, '') // strip pseudo-protocols
    .replace(/[<>]/g, '') // strip raw brackets
    .trim()
    .slice(0, maxLen);
}

export const sanitizeInput = sanitizeString;

export function parseCsvList(input: string): string[] {
  if (!input) return [];
  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}
