# Dataset Specifications & Provenance

## Dataset Overview
The dataset contains a rich, carefully validated catalog of **120+ authentic meal items** covering diverse culinary traditions with deep representation for **Indian Cuisine (South Indian, North Indian, Street & Fitness Bowls)** alongside Continental, Mediterranean, and Asian dishes.

## Nutritional Data Integrity
All nutritional metrics (Calories, Protein, Carbohydrates, Total Fat, Dietary Fiber, Sodium, Glycemic Index category) are standardized per serving from verified public reference databases including:
- **USDA FoodData Central** (U.S. Department of Agriculture)
- **Indian Food Composition Tables (IFCT 2017)** — National Institute of Nutrition (ICMR-NIN), Hyderabad.
- Standard culinary nutritional composition references (Public Domain / Open Data).

## Schema Definition
Each food record follows this standardized TypeScript / JSON schema:

```typescript
interface FoodItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Pre-Workout' | 'Post-Workout';
  cuisine: 'South Indian' | 'North Indian' | 'Indian General' | 'Continental' | 'Asian' | 'Mediterranean';
  dietaryType: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Eggetarian';
  calories: number;        // kcal per serving
  protein: number;         // grams
  carbohydrates: number;   // grams
  fat: number;             // grams
  fiber: number;           // grams
  sodium: number;          // mg
  glycemicIndex: 'Low' | 'Medium' | 'High';
  allergens: string[];     // ['Peanuts', 'Dairy', 'Gluten', 'Soy', 'Egg', 'Fish', 'Tree Nuts']
  ingredients: string[];   // Tokenized primary ingredients for preference learning
  priceLevel: '$' | '$$' | '$$$';
  healthFlags: string[];   // ['Heart-Healthy', 'High-Protein', 'Low-Sodium', 'Diabetic-Friendly', 'Fiber-Rich']
  image: string;           // Curated image URL / placeholder SVG
  description: string;
  servingSize: string;
}
```

## Representative Categories
1. **South Indian Staples**: Idli with Sambar, Masala Dosa, Upma, Ven Pongal, Ragi Mudde, Oats Idli, Chettinad Chicken Bowl, Fish Curry with Brown Rice, Pesarattu.
2. **North Indian Delicacies**: Paneer Bhurji, Dal Makhani (Healthy Style), Palak Paneer, Tandoori Chicken Breast, Chana Masala with Multigrain Roti, Rajma Rice, Moong Dal Khichdi, Chicken Tikka Salad.
3. **Fitness & High-Protein Bowls**: Sprouted Moong Salad, Soya Chunks Stir Fry, Egg White Scramble with Toast, Grilled Tofu Quinoa Bowl, Greek Yogurt Fruit Bowl, Whey Protein Oats Smoothie.
4. **Continental & Global Options**: Grilled Salmon with Steamed Asparagus, Mediterranean Chickpea Salad, Oatmeal with Almonds & Berries, Avocado Toast with Poached Egg, Stir-Fried Tofu Veggie Bowl.
