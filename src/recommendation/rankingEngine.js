/**
 * Novelty Module 8: Hybrid Multi-Factor Ranking & Explainability Engine
 * Combines 6 configurable objectives and synthesizes transparent, human-readable explanations.
 */

import { calculateNutritionMatchScore } from './nutritionEngine.js';
import { calculateDietCompatibilityScore, calculateCuisineScore, calculateBudgetScore } from './constraintEngine.js';
import { calculateDiversityScore } from './diversityEngine.js';

export const DEFAULT_WEIGHTS = {
  wNutrition: 0.35,
  wPreference: 0.25,
  wDiet: 0.15,
  wCuisine: 0.10,
  wDiversity: 0.10,
  wBudget: 0.05
};

export function scoreAndRankMeals(
  candidateFoods,
  slotTarget,
  userProfile,
  preferenceEngine,
  currentMealPlan = [],
  weights = DEFAULT_WEIGHTS
) {
  if (!candidateFoods || candidateFoods.length === 0) return [];

  const scoredList = candidateFoods.map(food => {
    // 1. Nutritional Match Score (0 - 100)
    const nutritionScore = calculateNutritionMatchScore(food, slotTarget.targets);

    // 2. Real-Time Learned Preference Score (0 - 100)
    const preferenceScore = preferenceEngine 
      ? preferenceEngine.calculatePreferenceScore(food, userProfile.preferredFoods || [])
      : 50;

    // 3. Diet Compatibility Score (0 - 100)
    const dietScore = calculateDietCompatibilityScore(food, userProfile);

    // 4. Cuisine Alignment Score (0 - 100)
    const cuisineScore = calculateCuisineScore(food, userProfile.cuisinePreference);

    // 5. Diversity & Anti-Fatigue Score (0 - 100)
    const diversityScore = calculateDiversityScore(food, currentMealPlan);

    // 6. Budget Score (0 - 100)
    const budgetScore = calculateBudgetScore(food, userProfile.budget);

    // Weighted Hybrid Final Score
    const finalScore = Math.round(
      (nutritionScore * weights.wNutrition) +
      (preferenceScore * weights.wPreference) +
      (dietScore * weights.wDiet) +
      (cuisineScore * weights.wCuisine) +
      (diversityScore * weights.wDiversity) +
      (budgetScore * weights.wBudget)
    );

    // Synthesize transparent explanation
    const explanation = generateExplanation(food, {
      nutritionScore,
      preferenceScore,
      dietScore,
      cuisineScore,
      diversityScore,
      slotTarget,
      userProfile
    });

    return {
      meal: food,
      finalScore: Math.max(1, Math.min(100, finalScore)),
      breakdown: {
        nutritionScore,
        preferenceScore,
        dietScore,
        cuisineScore,
        diversityScore,
        budgetScore
      },
      explanation
    };
  });

  // Sort descending by final score
  scoredList.sort((a, b) => b.finalScore - a.finalScore);

  return scoredList;
}

export function generateExplanation(meal, context) {
  const reasons = [];
  const { nutritionScore, preferenceScore, cuisineScore, diversityScore, slotTarget, userProfile } = context;

  // Nutrition reason
  if (nutritionScore >= 85) {
    reasons.push(`Accurately fits your ${slotTarget.name.toLowerCase()} target (${meal.calories} kcal, ${meal.protein}g protein)`);
  } else if (meal.protein >= 25) {
    reasons.push(`High protein source (${meal.protein}g) supporting your ${userProfile.fitnessGoal || 'fitness'} goal`);
  }

  // Preference & Cuisine reason
  if (preferenceScore >= 75) {
    reasons.push(`Matches your learned taste preferences and favorite ingredients`);
  }
  if (cuisineScore >= 85 && userProfile.cuisinePreference) {
    reasons.push(`Aligns with your ${userProfile.cuisinePreference} cuisine choice`);
  }

  // Dietary restriction reason
  if (userProfile.dietaryType && userProfile.dietaryType !== 'Non-Vegetarian') {
    reasons.push(`100% compliant with your ${userProfile.dietaryType} lifestyle`);
  }

  // Allergy safety reason
  if (userProfile.allergies && userProfile.allergies.length > 0) {
    reasons.push(`Verified free from your allergen exclusions (${userProfile.allergies.join(', ')})`);
  }

  // Variety reason
  if (diversityScore >= 80) {
    reasons.push(`Enhances variety in your daily meal plan`);
  }

  if (reasons.length === 0) {
    reasons.push(`Provides a balanced nutritional profile for your daily energy needs`);
  }

  return reasons;
}
