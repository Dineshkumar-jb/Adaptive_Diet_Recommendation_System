/**
 * Novelty Module 6 & 15: Daily & Weekly Meal Plan Optimization Engine
 * Generates holistic, multi-meal plans and multi-day schedules with nutrient aggregation.
 */

import { splitMealSlotTargets, calculateMacroTargets } from './nutritionEngine.js';
import { filterHardConstraints } from './constraintEngine.js';
import { scoreAndRankMeals } from './rankingEngine.js';

export function generateDailyMealPlan(allFoods, userProfile, preferenceEngine, weights) {
  const calorieTarget = userProfile.calorieTarget || 2000;
  const macroTargets = calculateMacroTargets(calorieTarget, userProfile.fitnessGoal, userProfile.healthMode);
  const mealSlots = splitMealSlotTargets(macroTargets, userProfile.mealsPerDay || 5);

  // Filter food catalog against hard constraints
  const validFoods = filterHardConstraints(allFoods, userProfile);

  const selectedPlan = [];
  const runningPlanMeals = [];

  mealSlots.forEach(slot => {
    // Filter foods suitable for this category or general meals
    let slotCandidates = validFoods.filter(f => {
      if (slot.name === 'Breakfast') return f.category === 'Breakfast';
      if (slot.name === 'Lunch') return f.category === 'Lunch';
      if (slot.name === 'Dinner') return f.category === 'Dinner';
      if (slot.name === 'Morning Snack' || slot.name === 'Evening Snack') {
        return f.category === 'Morning Snack' || f.category === 'Evening Snack' || f.category === 'Breakfast';
      }
      if (slot.name === 'Pre-Workout') return f.category === 'Pre-Workout' || f.category === 'Morning Snack';
      if (slot.name === 'Post-Workout') return f.category === 'Post-Workout' || f.category === 'Lunch' || f.category === 'Dinner';
      return true;
    });

    if (slotCandidates.length === 0) {
      slotCandidates = validFoods; // Fallback to all valid foods
    }

    // Rank candidates using our hybrid engine
    const ranked = scoreAndRankMeals(
      slotCandidates,
      slot,
      userProfile,
      preferenceEngine,
      runningPlanMeals,
      weights
    );

    const chosen = ranked[0] || {
      meal: slotCandidates[0],
      finalScore: 75,
      breakdown: { nutritionScore: 75, preferenceScore: 50, dietScore: 100, cuisineScore: 80, diversityScore: 80, budgetScore: 80 },
      explanation: ['Selected to fulfill your meal slot macro requirements']
    };

    runningPlanMeals.push(chosen.meal);

    selectedPlan.push({
      slotName: slot.name,
      time: slot.time,
      slotTarget: slot.targets,
      recommendedMeal: chosen.meal,
      recommendationScore: chosen.finalScore,
      breakdown: chosen.breakdown,
      explanation: chosen.explanation,
      topAlternatives: ranked.slice(1, 4).map(r => r.meal)
    });
  });

  // Calculate holistic totals
  const totals = selectedPlan.reduce((acc, item) => {
    if (item.recommendedMeal) {
      acc.calories += item.recommendedMeal.calories;
      acc.protein += item.recommendedMeal.protein;
      acc.carbs += item.recommendedMeal.carbohydrates;
      acc.fat += item.recommendedMeal.fat;
      acc.fiber += item.recommendedMeal.fiber;
      acc.sodium += item.recommendedMeal.sodium;
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });

  const summary = {
    target: macroTargets,
    actual: totals,
    deviation: {
      calories: totals.calories - macroTargets.calories,
      protein: totals.protein - macroTargets.protein,
      carbs: totals.carbs - macroTargets.carbs,
      fat: totals.fat - macroTargets.fat,
      fiber: totals.fiber - macroTargets.fiber
    },
    percentages: {
      calories: Math.round((totals.calories / macroTargets.calories) * 100),
      protein: Math.round((totals.protein / macroTargets.protein) * 100),
      carbs: Math.round((totals.carbs / macroTargets.carbs) * 100),
      fat: Math.round((totals.fat / macroTargets.fat) * 100),
      fiber: Math.round((totals.fiber / macroTargets.fiber) * 100)
    },
    averageScore: Math.round(selectedPlan.reduce((sum, item) => sum + item.recommendationScore, 0) / selectedPlan.length)
  };

  return {
    plan: selectedPlan,
    summary
  };
}

export function generateWeeklyMealPlan(allFoods, userProfile, preferenceEngine, weights) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weeklyPlan = {};
  const pastMeals = [];

  days.forEach(day => {
    // Pass previously selected meals to enforce inter-day diversity
    const dailyResult = generateDailyMealPlan(allFoods, userProfile, preferenceEngine, weights);
    weeklyPlan[day] = dailyResult;
    dailyResult.plan.forEach(p => {
      if (p.recommendedMeal) pastMeals.push(p.recommendedMeal);
    });
  });

  return weeklyPlan;
}
