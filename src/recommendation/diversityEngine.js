/**
 * Novelty Module 7: Diversity & Fatigue Control Engine
 * Penalizes meal, ingredient, and cuisine over-repetition to create balanced, realistic meal plans.
 */

export function calculateDiversityScore(candidateMeal, currentMealPlan = [], recentDaysMeals = []) {
  if (!candidateMeal) return 100;
  if (currentMealPlan.length === 0 && recentDaysMeals.length === 0) return 100;

  let score = 100;
  const candidateIngredients = candidateMeal.ingredients || [];
  const candidateCuisine = candidateMeal.cuisine;

  // 1. Exact dish duplication penalty
  const sameDishToday = currentMealPlan.some(m => m && m.id === candidateMeal.id);
  if (sameDishToday) return 15; // Severe penalty: do not repeat exact dish on the same day

  const sameDishRecently = recentDaysMeals.some(m => m && m.id === candidateMeal.id);
  if (sameDishRecently) score -= 35; // Moderate penalty for yesterday's meal

  // 2. Ingredient overlap Jaccard penalty with today's chosen meals
  currentMealPlan.forEach(existingMeal => {
    if (!existingMeal) return;
    const existingIngredients = existingMeal.ingredients || [];
    
    // Count shared primary ingredients
    const sharedIngredients = candidateIngredients.filter(ing => 
      existingIngredients.some(eIng => eIng.toLowerCase() === ing.toLowerCase())
    );

    if (sharedIngredients.length > 0) {
      // E.g. If both contain "paneer" or "chicken" or "rice"
      score -= (sharedIngredients.length * 12);
    }
  });

  // 3. Excessive cuisine repetition dampening
  const sameCuisineTodayCount = currentMealPlan.filter(m => m && m.cuisine === candidateCuisine).length;
  if (sameCuisineTodayCount >= 3) {
    score -= 20; // Suggest cross-cuisine variety
  }

  return Math.max(10, Math.min(100, Math.round(score)));
}
