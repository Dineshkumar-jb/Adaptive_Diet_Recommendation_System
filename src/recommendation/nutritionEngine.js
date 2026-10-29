/**
 * Novelty Module 1 & 2: Anthropometric Nutrition Engine & Macro Calculator
 * Implements validated Mifflin-St Jeor equation and goal-specific macronutrient allocation.
 */

export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return { bmi: 0, category: 'Unknown', prime: 0 };
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
  else if (bmi >= 30) category = 'Obese';
  return { bmi, category };
}

export function calculateBMR(gender, weightKg, heightCm, age) {
  // Mifflin-St Jeor Equation
  if (gender?.toLowerCase() === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  // Default Male
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

export function calculateTDEE(bmr, activityMultiplier = 1.55) {
  return Math.round(bmr * activityMultiplier);
}

export function calculateCalorieTarget(tdee, goal = 'general', healthMode = 'general') {
  let delta = 0;
  if (goal === 'weight_loss' || healthMode === 'weight_loss') {
    delta = -500; // standard healthy deficit
  } else if (goal === 'muscle_gain' || healthMode === 'muscle_gain') {
    delta = 400; // clean lean surplus
  }
  const target = Math.max(1300, tdee + delta); // Safe minimum floor
  return target;
}

export function calculateMacroTargets(calorieTarget, goal = 'general', healthMode = 'general') {
  let pRatio = 0.25;
  let cRatio = 0.50;
  let fRatio = 0.25;

  if (goal === 'muscle_gain' || healthMode === 'muscle_gain') {
    pRatio = 0.32;
    cRatio = 0.45;
    fRatio = 0.23;
  } else if (goal === 'weight_loss' || healthMode === 'weight_loss') {
    pRatio = 0.35;
    cRatio = 0.38;
    fRatio = 0.27;
  } else if (healthMode === 'blood_sugar') {
    pRatio = 0.30;
    cRatio = 0.35;
    fRatio = 0.35;
  } else if (healthMode === 'low_sodium') {
    pRatio = 0.25;
    cRatio = 0.55;
    fRatio = 0.20;
  }

  const proteinGrams = Math.round((calorieTarget * pRatio) / 4);
  const carbGrams = Math.round((calorieTarget * cRatio) / 4);
  const fatGrams = Math.round((calorieTarget * fRatio) / 9);
  const fiberGrams = Math.max(28, Math.round((calorieTarget / 1000) * 14)); // 14g per 1000 kcal standard

  return {
    calories: calorieTarget,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
    fiber: fiberGrams
  };
}

export function splitMealSlotTargets(totalTargets, mealsPerDay = 5) {
  // Configurable dynamic meal distributions
  let distributions = [];
  if (mealsPerDay === 3) {
    distributions = [
      { name: 'Breakfast', ratio: 0.30, time: '08:00 AM' },
      { name: 'Lunch', ratio: 0.40, time: '01:00 PM' },
      { name: 'Dinner', ratio: 0.30, time: '08:00 PM' }
    ];
  } else if (mealsPerDay === 4) {
    distributions = [
      { name: 'Breakfast', ratio: 0.25, time: '08:00 AM' },
      { name: 'Lunch', ratio: 0.35, time: '01:00 PM' },
      { name: 'Evening Snack', ratio: 0.15, time: '05:00 PM' },
      { name: 'Dinner', ratio: 0.25, time: '08:00 PM' }
    ];
  } else if (mealsPerDay === 6) {
    distributions = [
      { name: 'Breakfast', ratio: 0.20, time: '07:30 AM' },
      { name: 'Morning Snack', ratio: 0.12, time: '10:30 AM' },
      { name: 'Lunch', ratio: 0.28, time: '01:00 PM' },
      { name: 'Pre-Workout', ratio: 0.12, time: '04:30 PM' },
      { name: 'Post-Workout', ratio: 0.10, time: '06:30 PM' },
      { name: 'Dinner', ratio: 0.18, time: '08:30 PM' }
    ];
  } else {
    // Default 5 meals
    distributions = [
      { name: 'Breakfast', ratio: 0.25, time: '08:00 AM' },
      { name: 'Morning Snack', ratio: 0.12, time: '11:00 AM' },
      { name: 'Lunch', ratio: 0.33, time: '01:30 PM' },
      { name: 'Evening Snack', ratio: 0.10, time: '05:00 PM' },
      { name: 'Dinner', ratio: 0.20, time: '08:00 PM' }
    ];
  }

  return distributions.map(slot => ({
    name: slot.name,
    time: slot.time,
    ratio: slot.ratio,
    targets: {
      calories: Math.round(totalTargets.calories * slot.ratio),
      protein: Math.round(totalTargets.protein * slot.ratio),
      carbs: Math.round(totalTargets.carbs * slot.ratio),
      fat: Math.round(totalTargets.fat * slot.ratio),
      fiber: Math.round(totalTargets.fiber * slot.ratio)
    }
  }));
}

/**
 * Calculates a normalized nutrition matching score between 0 and 100.
 */
export function calculateNutritionMatchScore(meal, target, weights = { cal: 0.40, prot: 0.30, carb: 0.15, fat: 0.15 }) {
  if (!meal || !target) return 50;

  const calDiff = Math.abs(meal.calories - target.calories) / Math.max(1, target.calories);
  const protDiff = Math.abs(meal.protein - target.protein) / Math.max(1, target.protein);
  const carbDiff = Math.abs(meal.carbohydrates - target.carbs) / Math.max(1, target.carbs);
  const fatDiff = Math.abs(meal.fat - target.fat) / Math.max(1, target.fat);

  const weightedDeviation = (
    calDiff * weights.cal +
    protDiff * weights.prot +
    carbDiff * weights.carb +
    fatDiff * weights.fat
  );

  // Convert deviation to percentage similarity (0-100)
  const score = Math.max(10, Math.min(100, Math.round((1 - weightedDeviation) * 100)));
  return score;
}
