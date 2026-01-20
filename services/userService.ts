import { UserProfile } from '../types';

const CURRENT_USER_KEY = 'crypto_ai_current_session';
const USER_PREFIX = 'crypto_user_';

// --- UTILITIES ---

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback if crypto is available but randomUUID fails
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const storage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('LocalStorage access denied', e);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('LocalStorage write failed', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('LocalStorage remove failed', e);
    }
  }
};

// --- USER MANAGEMENT ---

const defaultProfile = (email: string): UserProfile => ({
  email,
  isPro: false,
  freeUsageCount: 0,
  maxFreeUsage: 5
});

export const loginUser = (email: string): UserProfile => {
  storage.setItem(CURRENT_USER_KEY, email);
  return getUserProfile();
};

export const logoutUser = () => {
  storage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUserEmail = (): string | null => {
  return storage.getItem(CURRENT_USER_KEY);
};

export const getUserProfile = (): UserProfile => {
  const email = getCurrentUserEmail();
  if (!email) return defaultProfile('guest');

  const storageKey = `${USER_PREFIX}${email}`;
  const stored = storage.getItem(storageKey);
  
  if (!stored) {
    const newProfile = defaultProfile(email);
    storage.setItem(storageKey, JSON.stringify(newProfile));
    return newProfile;
  }
  
  return JSON.parse(stored);
};

const saveProfile = (profile: UserProfile) => {
  if (!profile.email || profile.email === 'guest') return;
  const storageKey = `${USER_PREFIX}${profile.email}`;
  storage.setItem(storageKey, JSON.stringify(profile));
};

export const incrementUsage = (): UserProfile => {
  const profile = getUserProfile();
  // If pro, we don't count limit (or we track it differently), but for free users we increment
  if (!profile.isPro) {
    profile.freeUsageCount += 1;
    saveProfile(profile);
  }
  return profile;
};

export const canUseAI = (): boolean => {
  const profile = getUserProfile();
  if (profile.isPro) return true;
  return profile.freeUsageCount < profile.maxFreeUsage;
};

export const upgradeToPro = (): UserProfile => {
  const profile = getUserProfile();
  profile.isPro = true;
  profile.subscriptionDate = new Date().toISOString();
  saveProfile(profile);
  return profile;
};

export const getUsagePercent = (): number => {
    const profile = getUserProfile();
    if (profile.isPro) return 100;
    return (profile.freeUsageCount / profile.maxFreeUsage) * 100;
};