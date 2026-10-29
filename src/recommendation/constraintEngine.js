/**
 * Novelty Module 3 & 10: Multi-Constraint Satisfaction Engine
 * Strictly filters out allergen & dietary violations (Hard Constraints)
 * and scores soft preferences (Cuisine, Budget, Health Mode tags).
 */

export function filterHardConstraints(foodList, userProfile, userPreferences = {}) {
  const allergies = userPreferences.allergies || userProfile.allergies || [];
  const dietaryType = userProfile.dietaryType || 'Non-Vegetarian';
  const dislikedFoods = (userPreferences.dislikedFoods || userProfile.dislikedFoods || []).map(f => f.toLowerCase().trim());
  const excludedIngredients = (userPreferences.excludedIngredients || []).map(i => i.toLowerCase().trim());
  const healthMode = userProfile.healthMode || 'general';

  return foodList.filter(food => {
    // 1. ALLERGEN FILTER (Zero tolerance)
    if (allergies.length > 0 && food.allergens && food.allergens.length > 0) {
      const hasAllergy = food.allergens.some(allergen => 
        allergies.some(userAllergy => userAllergy.toLowerCase() === allergen.toLowerCase())
      );
      if (hasAllergy) return false;
    }

    // 2. DIETARY RESTRICTION FILTER
    if (dietaryType === 'Vegan') {
      if (food.dietaryType !== 'Vegan') return false;
    } else if (dietaryType === 'Vegetarian') {
      if (food.dietaryType === 'Non-Vegetarian' || food.dietaryType === 'Eggetarian') return false;
    } else if (dietaryType === 'Eggetarian') {
      if (food.dietaryType === 'Non-Vegetarian') return false;
    }

    // 3. EXPLICIT DISLIKED & EXCLUDED INGREDIENT FILTER
    const foodNameLower = food.name.toLowerCase();
    const foodIngredientsLower = (food.ingredients || []).map(i => i.toLowerCase());

    const isExplicitlyDisliked = dislikedFoods.some(dislike => {
      if (!dislike) return false;
      return foodNameLower.includes(dislike) || foodIngredientsLower.some(ing => ing.includes(dislike));
    });
    if (isExplicitlyDisliked) return false;

    const isExcludedIngredient = excludedIngredients.some(exc => {
      if (!exc) return false;
      return foodIngredientsLower.some(ing => ing.includes(exc));
    });
    if (isExcludedIngredient) return false;

    // 4. HEALTH-MODE HARD THRESHOLDS
    if (healthMode === 'low_sodium' && food.sodium > 600) {
      return false; // Cap single meal sodium for heart/low-sodium constraint
    }

    return true;
  });
}

export function calculateDietCompatibilityScore(food, userProfile) {
  // Returns 0 - 100 compatibility score
  const dietaryType = userProfile.dietaryType || 'Non-Vegetarian';
  if (dietaryType === 'Vegan' && food.dietaryType === 'Vegan') return 100;
  if (dietaryType === 'Vegetarian' && (food.dietaryType === 'Vegetarian' || food.dietaryType === 'Vegan')) return 100;
  if (dietaryType === 'Eggetarian' && food.dietaryType !== 'Non-Vegetarian') return 100;
  if (dietaryType === 'Non-Vegetarian') return 100;
  return 40;
}

export function calculateCuisineScore(food, preferredCuisine) {
  if (!preferredCuisine || preferredCuisine === 'Any') return 80;
  if (food.cuisine.toLowerCase() === preferredCuisine.toLowerCase()) return 100;
  if (preferredCuisine.includes('Indian') && food.cuisine.includes('Indian')) return 85;
  return 50;
}

export function calculateBudgetScore(food, preferredBudget) {
  if (!preferredBudget) return 80;
  if (food.priceLevel === preferredBudget) return 100;
  if (preferredBudget === '$$$' && food.priceLevel === '$$') return 90;
  if (preferredBudget === '$' && food.priceLevel === '$$$') return 40;
  return 75;
}
