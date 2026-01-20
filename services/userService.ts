import { UserProfile } from '../types';

const CURRENT_USER_KEY = 'crypto_ai_current_session';
const USER_PREFIX = 'crypto_user_';

const defaultProfile = (email: string): UserProfile => ({
  email,
  isPro: false,
  freeUsageCount: 0,
  maxFreeUsage: 5
});

// Helper for safe storage access
const safeStorage = {
  getItem: (key: string) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch (e) { }
  },
  removeItem: (key: string) => {
    try { localStorage.removeItem(key); } catch (e) { }
  }
};

export const loginUser = (email: string): UserProfile => {
  safeStorage.setItem(CURRENT_USER_KEY, email);
  return getUserProfile();
};

export const logoutUser = () => {
  safeStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUserEmail = (): string | null => {
  return safeStorage.getItem(CURRENT_USER_KEY);
};

export const getUserProfile = (): UserProfile => {
  const email = getCurrentUserEmail();
  if (!email) return defaultProfile('guest');

  const storageKey = `${USER_PREFIX}${email}`;
  const stored = safeStorage.getItem(storageKey);
  
  if (!stored) {
    const newProfile = defaultProfile(email);
    safeStorage.setItem(storageKey, JSON.stringify(newProfile));
    return newProfile;
  }
  
  return JSON.parse(stored);
};

const saveProfile = (profile: UserProfile) => {
  if (!profile.email || profile.email === 'guest') return;
  const storageKey = `${USER_PREFIX}${profile.email}`;
  safeStorage.setItem(storageKey, JSON.stringify(profile));
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