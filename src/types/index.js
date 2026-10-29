/**
 * Type Definitions and Data Contracts for the Adaptive Diet Recommender
 */

export const DIETARY_TYPES = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'];
export const CUISINE_TYPES = ['South Indian', 'North Indian', 'Indian General', 'Continental', 'Asian', 'Mediterranean'];
export const MEAL_CATEGORIES = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Pre-Workout', 'Post-Workout'];
export const HEALTH_MODES = [
  { id: 'general', name: 'General Healthy Eating', desc: 'Balanced macronutrients with high fiber and wholesome foods' },
  { id: 'weight_loss', name: 'Weight Management (Deficit)', desc: 'Higher protein, moderate carbs, controlled healthy fats (-500 kcal)' },
  { id: 'muscle_gain', name: 'High-Protein Fitness (Surplus)', desc: 'Surplus calories (+400 kcal) with 30-35% protein optimization' },
  { id: 'low_sodium', name: 'Heart-Conscious / Low Sodium', desc: 'Sodium capped < 500mg/meal, low saturated fat, omega-3 rich' },
  { id: 'blood_sugar', name: 'Blood-Sugar-Conscious', desc: 'Low GI carbs, high soluble fiber, low refined sugars' },
  { id: 'budget_friendly', name: 'Budget-Conscious Eating', desc: 'Cost-efficient wholesome protein and carb sources' }
];

export const ALLERGEN_OPTIONS = ['Peanuts', 'Dairy', 'Gluten', 'Soy', 'Egg', 'Fish', 'Tree Nuts', 'Shellfish'];

export const ACTIVITY_LEVELS = [
  { value: 1.20, label: 'Sedentary (Little or no exercise, desk job)' },
  { value: 1.375, label: 'Lightly Active (Light exercise 1-3 days/week)' },
  { value: 1.55, label: 'Moderately Active (Moderate exercise 3-5 days/week)' },
  { value: 1.725, label: 'Very Active (Hard exercise 6-7 days/week)' },
  { value: 1.90, label: 'Extra Active (Very heavy training or physical job)' }
];
