import { UserSession } from '../types';

const AUTH_STORAGE_KEY = 'projectpilot_user_session';

export const authService = {
  getCurrentUser(): UserSession | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      const user = JSON.parse(data) as UserSession;

      // Purge stale hardcoded demo user if previously stored
      if (user.displayName === 'Alex Morgan' || user.userId === 'usr_demo_finalyear_student') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }

      // Ensure uid alias is always present
      if (!user.uid && user.userId) {
        user.uid = user.userId;
      }

      // Synchronize with stored profile in users/{uid} if present
      if (user.uid) {
        try {
          const profileRaw = localStorage.getItem(`users/${user.uid}`);
          if (profileRaw) {
            const p = JSON.parse(profileRaw);
            if (p.name && p.name.trim() && !p.name.includes('Alex Morgan')) {
              user.displayName = p.name.trim();
            }
          }
        } catch {
          // ignore parsing error
        }
      }

      return user;
    } catch {
      return null;
    }
  },

  async login(email: string, password?: string): Promise<{ user?: UserSession; error?: string }> {
    if (!email || !email.includes('@')) {
      return { error: 'Please enter a valid academic email address.' };
    }
    if (password && password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const cleanEmail = email.toLowerCase().trim();
    const uid = `usr_${btoa(cleanEmail).slice(0, 16).replace(/[^a-zA-Z0-9]/g, '')}`;

    // Check if an existing profile exists in users/{uid}
    let resolvedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    try {
      const existingProfileData = localStorage.getItem(`users/${uid}`);
      if (existingProfileData) {
        const p = JSON.parse(existingProfileData);
        if (p.name && p.name.trim() && !p.name.includes('Alex Morgan')) {
          resolvedName = p.name.trim();
        }
      }
    } catch {
      // ignore
    }

    const user: UserSession = {
      uid,
      userId: uid,
      email: cleanEmail,
      displayName: resolvedName,
      token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      isDemo: false,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { user };
  },

  async register(name: string, email: string, password?: string): Promise<{ user?: UserSession; error?: string }> {
    if (!name || name.trim().length < 2) {
      return { error: 'Please enter your full name.' };
    }
    if (!email || !email.includes('@')) {
      return { error: 'Please enter a valid academic email address.' };
    }
    if (password && password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    const cleanEmail = email.toLowerCase().trim();
    const uid = `usr_${btoa(cleanEmail).slice(0, 16).replace(/[^a-zA-Z0-9]/g, '')}`;
    const cleanName = name.trim();

    const user: UserSession = {
      uid,
      userId: uid,
      email: cleanEmail,
      displayName: cleanName,
      token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      isDemo: false,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    // Also prime initial users/{uid} record
    try {
      const existingProfile = localStorage.getItem(`users/${uid}`);
      if (!existingProfile) {
        localStorage.setItem(`users/${uid}`, JSON.stringify({
          userId: uid,
          uid,
          name: cleanName,
          email: cleanEmail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
    } catch {
      // ignore
    }

    return { user };
  },

  async updateDisplayName(displayName: string): Promise<UserSession | null> {
    try {
      const current = this.getCurrentUser();
      if (!current) return null;
      current.displayName = displayName.trim();
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(current));
      return current;
    } catch {
      return null;
    }
  },

  async loginAsDemoStudent(): Promise<UserSession> {
    const demoUser: UserSession = {
      uid: 'usr_demo_evaluator',
      userId: 'usr_demo_evaluator',
      email: 'evaluator.demo@university.edu',
      displayName: 'Demo Evaluator',
      token: 'tok_demo_secure_evaluator_session',
      isDemo: true,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
    return demoUser;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
