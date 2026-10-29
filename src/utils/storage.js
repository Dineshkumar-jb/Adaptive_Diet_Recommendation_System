/**
 * Storage Utility for Local Persistence using Browser localStorage
 */

const STORAGE_KEYS = {
  PROFILE: 'adaptive_diet_user_profile',
  PREFERENCES: 'adaptive_diet_preferences_state',
  ACTIVE_PLAN: 'adaptive_diet_active_plan',
  WEEKLY_PLAN: 'adaptive_diet_weekly_plan',
  HISTORY: 'adaptive_diet_interaction_history',
  WEIGHTS: 'adaptive_diet_weights'
};

export const Storage = {
  saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },

  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  savePreferenceState(state) {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },

  getPreferenceState() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveActivePlan(planResult) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, JSON.stringify(planResult));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },

  getActivePlan() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveWeeklyPlan(weeklyResult) {
    try {
      localStorage.setItem(STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(weeklyResult));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },

  getWeeklyPlan() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_PLAN);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveWeights(weights) {
    try {
      localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },

  getWeights() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
  }
};
