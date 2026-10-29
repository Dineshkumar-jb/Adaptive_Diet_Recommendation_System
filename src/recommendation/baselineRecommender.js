/**
 * Baseline Recommendation System
 * Implementation of the standard content-based KNN nutrient matching baseline model.
 * Used for rigorous offline and online scientific benchmarking.
 */

export class BaselineRecommender {
  constructor(foodCatalog) {
    this.foods = foodCatalog || [];
  }

  /**
   * Baseline KNN / Euclidean Distance matching on normalized nutrient vector:
   * [Calories, Protein, Carbohydrates, Fat]
   */
  recommendForSlot(slotTarget, k = 5) {
    const targetVector = [
      slotTarget.calories,
      slotTarget.protein,
      slotTarget.carbs,
      slotTarget.fat
    ];

    const scored = this.foods.map(food => {
      const foodVector = [
        food.calories,
        food.protein,
        food.carbohydrates,
        food.fat
      ];

      // Normalized Euclidean Distance
      const dist = Math.sqrt(
        Math.pow((foodVector[0] - targetVector[0]) / Math.max(1, targetVector[0]), 2) +
        Math.pow((foodVector[1] - targetVector[1]) / Math.max(1, targetVector[1]), 2) +
        Math.pow((foodVector[2] - targetVector[2]) / Math.max(1, targetVector[2]), 2) +
        Math.pow((foodVector[3] - targetVector[3]) / Math.max(1, targetVector[3]), 2)
      );

      const similarity = 1 / (1 + dist);

      return {
        meal: food,
        similarityScore: Math.round(similarity * 100)
      };
    });

    // Baseline sorts purely by nutrient distance (ignores allergies, learned preferences, and variety)
    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    return scored.slice(0, k);
  }

  generateBaselineDailyPlan(totalTargets, mealsPerDay = 5) {
    const slotCal = Math.round(totalTargets.calories / mealsPerDay);
    const slotProt = Math.round(totalTargets.protein / mealsPerDay);
    const slotCarbs = Math.round(totalTargets.carbs / mealsPerDay);
    const slotFat = Math.round(totalTargets.fat / mealsPerDay);

    const slotTarget = { calories: slotCal, protein: slotProt, carbs: slotCarbs, fat: slotFat };
    const plan = [];

    for (let i = 0; i < mealsPerDay; i++) {
      const recs = this.recommendForSlot(slotTarget, 3);
      plan.push({
        slotIndex: i + 1,
        slotName: `Meal ${i + 1}`,
        recommendedMeal: recs[0].meal,
        score: recs[0].similarityScore
      });
    }

    return plan;
  }
}
