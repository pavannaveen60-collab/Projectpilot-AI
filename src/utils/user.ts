/**
 * Utility functions for user identity, names, and avatar initials.
 * Provides a single source of truth for student identity parsing.
 */

/**
 * Derives avatar initials from a student's display name according to the following rules:
 * - Multi-word names: First character of the first word + first character of the last word
 *   e.g. "PAVAN KUMAR N" -> "PN", "Rahul Sharma" -> "RS", "Pavan Kumar" -> "PK"
 * - Single-word names: First character of the word
 *   e.g. "Pavan" -> "P"
 * - Empty or whitespace: Returns empty string
 */
export function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return '';
  const clean = name.trim().replace(/[^\p{L}\p{N}\s]/gu, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Resolves the display name from the centralized profile and auth states.
 * Guarantees no stale or hardcoded demo values ("Alex Morgan", "AL") bleed through.
 */
export function resolveDisplayName(
  profileName?: string | null,
  profileFullName?: string | null,
  authDisplayName?: string | null,
  authEmail?: string | null
): string {
  // 1. Primary: Student profile's saved name
  if (profileName && profileName.trim().length > 0 && !profileName.includes('Alex Morgan')) {
    return profileName.trim();
  }
  if (profileFullName && profileFullName.trim().length > 0 && !profileFullName.includes('Alex Morgan')) {
    return profileFullName.trim();
  }

  // 2. Secondary: Authenticated user displayName
  if (authDisplayName && authDisplayName.trim().length > 0 && !authDisplayName.includes('Alex Morgan')) {
    return authDisplayName.trim();
  }

  // 3. Fallback: Email username
  if (authEmail && authEmail.includes('@')) {
    const local = authEmail.split('@')[0].replace(/[._]/g, ' ').trim();
    if (local.length > 0 && !local.toLowerCase().includes('alex')) {
      return local
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  return '';
}
