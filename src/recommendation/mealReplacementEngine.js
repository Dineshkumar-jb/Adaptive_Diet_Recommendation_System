/**
 * Novelty Module 5: Smart Macro-Preserving Meal Replacement Engine
 * Generates nutritionally equivalent alternative meals when a user rejects a recommendation.
 */

import { filterHardConstraints } from './constraintEngine.js';

export function findSmartReplacement(rejectedMeal, availableFoods, userProfile, preferenceEngine, currentPlan = []) {
  if (!rejectedMeal || !availableFoods || availableFoods.length === 0) return null;

  // Filter candidate pool with hard constraints
  const candidatePool = filterHardConstraints(availableFoods, userProfile, {
    dislikedFoods: [rejectedMeal.name, ...(userProfile.dislikedFoods || [])]
  }).filter(f => f.id !== rejectedMeal.id);

  if (candidatePool.length === 0) return null;

  // Rank candidates by Euclidean distance to rejected meal's macro vector + preference bonus
  const scoredReplacements = candidatePool.map(candidate => {
    // 1. Nutritional Vector Distance (normalized)
    const calDist = Math.abs(candidate.calories - rejectedMeal.calories) / Math.max(1, rejectedMeal.calories);
    const protDist = Math.abs(candidate.protein - rejectedMeal.protein) / Math.max(1, rejectedMeal.protein);
    const carbDist = Math.abs(candidate.carbohydrates - rejectedMeal.carbohydrates) / Math.max(1, rejectedMeal.carbohydrates);
    const fatDist = Math.abs(candidate.fat - rejectedMeal.fat) / Math.max(1, rejectedMeal.fat);

    const macroDistance = (calDist * 0.40) + (protDist * 0.35) + (carbDist * 0.15) + (fatDist * 0.10);
    const macroSimilarityScore = Math.max(0, 100 - (macroDistance * 100));

    // 2. Category Match Bonus (e.g. Breakfast -> Breakfast)
    let categoryScore = 70;
    if (candidate.category === rejectedMeal.category) categoryScore = 100;
    else if (
      (rejectedMeal.category === 'Lunch' && candidate.category === 'Dinner') ||
      (rejectedMeal.category === 'Dinner' && candidate.category === 'Lunch')
    ) {
      categoryScore = 90;
    }

    // 3. User Preference Score
    const prefScore = preferenceEngine ? preferenceEngine.calculatePreferenceScore(candidate, userProfile.preferredFoods) : 50;

    // 4. Duplicate penalty
    const isAlreadyInPlan = currentPlan.some(m => m && m.id === candidate.id);
    const diversityPenalty = isAlreadyInPlan ? 40 : 0;

    const totalReplacementScore = (macroSimilarityScore * 0.50) + (categoryScore * 0.25) + (prefScore * 0.25) - diversityPenalty;

    return {
      meal: candidate,
      replacementScore: Math.round(totalReplacementScore),
      macroSimilarity: Math.round(macroSimilarityScore),
      delta: {
        calories: candidate.calories - rejectedMeal.calories,
        protein: candidate.protein - rejectedMeal.protein,
        carbs: candidate.carbohydrates - rejectedMeal.carbohydrates,
        fat: candidate.fat - rejectedMeal.fat,
        fiber: candidate.fiber - rejectedMeal.fiber
      }
    };
  });

  // Sort descending by replacement score
  scoredReplacements.sort((a, b) => b.replacementScore - a.replacementScore);

  return scoredReplacements[0] || null;
}
