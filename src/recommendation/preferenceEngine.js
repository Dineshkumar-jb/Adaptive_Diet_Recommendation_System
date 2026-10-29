/**
 * Novelty Module 4: Real-Time Preference Learning Engine
 * Continuously adapts to user interactions (Like, Dislike, Favorite, Replace)
 * by updating ingredient and dish affinity scores.
 */

export class PreferenceEngine {
  constructor(initialState = {}) {
    this.ingredientWeights = initialState.ingredientWeights || {};
    this.likedDishes = new Set(initialState.likedDishes || []);
    this.dislikedDishes = new Set(initialState.dislikedDishes || []);
    this.favoriteDishes = new Set(initialState.favoriteDishes || []);
    this.replacedDishes = new Set(initialState.replacedDishes || []);
    this.interactionHistory = initialState.interactionHistory || [];
  }

  /**
   * Applies an interaction event to dynamically update preference weights.
   * Event Types: 'LIKE', 'DISLIKE', 'FAVORITE', 'REPLACE', 'SKIP'
   */
  registerFeedback(meal, eventType) {
    if (!meal) return;
    const timestamp = new Date().toISOString();
    const ingredients = meal.ingredients || [];
    const cuisine = meal.cuisine;

    let delta = 0;
    if (eventType === 'LIKE') {
      delta = 0.25;
      this.likedDishes.add(meal.id);
      this.dislikedDishes.delete(meal.id);
    } else if (eventType === 'FAVORITE') {
      delta = 0.45;
      this.favoriteDishes.add(meal.id);
      this.likedDishes.add(meal.id);
      this.dislikedDishes.delete(meal.id);
    } else if (eventType === 'DISLIKE') {
      delta = -0.40;
      this.dislikedDishes.add(meal.id);
      this.likedDishes.delete(meal.id);
      this.favoriteDishes.delete(meal.id);
    } else if (eventType === 'REPLACE') {
      delta = -0.25;
      this.replacedDishes.add(meal.id);
    }

    // Update ingredient weights
    ingredients.forEach(ing => {
      const key = ing.toLowerCase().trim();
      const current = this.ingredientWeights[key] || 0.0;
      this.ingredientWeights[key] = Math.max(-1.0, Math.min(1.0, Number((current + delta).toFixed(2))));
    });

    // Update cuisine affinity
    if (cuisine) {
      const cuisineKey = `cuisine:${cuisine.toLowerCase().trim()}`;
      const currentCuisine = this.ingredientWeights[cuisineKey] || 0.0;
      this.ingredientWeights[cuisineKey] = Math.max(-1.0, Math.min(1.0, Number((currentCuisine + delta * 0.5).toFixed(2))));
    }

    this.interactionHistory.unshift({
      mealId: meal.id,
      mealName: meal.name,
      eventType,
      timestamp
    });

    // Keep history capped at 100
    if (this.interactionHistory.length > 100) {
      this.interactionHistory.pop();
    }
  }

  /**
   * Computes a normalized preference score (0 - 100) for a candidate meal.
   */
  calculatePreferenceScore(meal, explicitPreferredFoods = []) {
    if (!meal) return 50;

    let score = 50; // Neutral baseline

    // Direct match bonuses/penalties
    if (this.favoriteDishes.has(meal.id)) {
      score += 35;
    } else if (this.likedDishes.has(meal.id)) {
      score += 20;
    } else if (this.dislikedDishes.has(meal.id)) {
      score -= 40;
    } else if (this.replacedDishes.has(meal.id)) {
      score -= 15;
    }

    // Explicit profile preferred food bonus
    const mealNameLower = meal.name.toLowerCase();
    const ingredients = meal.ingredients || [];
    const hasExplicitPref = explicitPreferredFoods.some(p => 
      mealNameLower.includes(p.toLowerCase()) || ingredients.some(i => i.toLowerCase().includes(p.toLowerCase()))
    );
    if (hasExplicitPref) score += 20;

    // Learned ingredient affinities sum
    let ingredientAffinitySum = 0;
    ingredients.forEach(ing => {
      const key = ing.toLowerCase().trim();
      if (this.ingredientWeights[key]) {
        ingredientAffinitySum += this.ingredientWeights[key];
      }
    });

    if (ingredients.length > 0) {
      const avgAffinity = ingredientAffinitySum / ingredients.length;
      score += avgAffinity * 30; // Scale contribution
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  exportState() {
    return {
      ingredientWeights: this.ingredientWeights,
      likedDishes: Array.from(this.likedDishes),
      dislikedDishes: Array.from(this.dislikedDishes),
      favoriteDishes: Array.from(this.favoriteDishes),
      replacedDishes: Array.from(this.replacedDishes),
      interactionHistory: this.interactionHistory
    };
  }
}
