# Baseline Recommendation System Analysis

## Baseline Overview
The baseline recommendation system is formulated as a standard content-based K-Nearest Neighbors (KNN) nutrient matching model.

## Baseline Architecture
```
User Profile (Age, Gender, Weight, Height, Activity Level)
     │
     ▼
Mifflin-St Jeor Equation → BMR & TDEE Calculation
     │
     ▼
Daily Calorie & Target Macro Estimation
     │
     ▼
Uniform Meal Splitting (e.g. 30% Breakfast, 40% Lunch, 30% Dinner)
     │
     ▼
Standard Nearest-Neighbors (KNN) / Euclidean Vector Matching:
  Distance(Food, Target) = sqrt( sum( (Food_nutrient_i - Target_nutrient_i)^2 ) )
     │
     ▼
Top-K Unconstrained Ranked Candidates
```

## Baseline Mathematical Formulation
In the baseline model, each candidate food item $f \in \mathcal{F}$ is represented by a feature vector in nutritional space:
$$\mathbf{x}_f = \left[ c_f, p_f, k_f, t_f \right]^T$$
where $c_f$ is Calories, $p_f$ is Protein, $k_f$ is Carbohydrates, and $t_f$ is Fat.

Given target vector $\mathbf{x}_{\text{target}}$ for a meal slot, the baseline computes similarity via normalized Euclidean distance:
$$\text{Sim}_{\text{baseline}}(f, \text{target}) = \frac{1}{1 + \|\mathbf{x}_f - \mathbf{x}_{\text{target}}\|_2}$$

## Baseline Limitations
1. **Zero Real-Time Adaptation**: User interactions (Likes, Dislikes, Skips, Favorites) are completely ignored; recommendations never improve over time.
2. **Lack of Hard vs. Soft Constraint Separation**: Allergies or strong food dislikes are either unhandled or treated as rough filters, leading to potential severe allergen exposure.
3. **No Diversity Mechanism**: The model repeatedly recommends the same top-ranked dish for multiple days (or multiple meal slots), causing extreme meal fatigue.
4. **No Semantic Explanation**: The user is presented with a raw list of foods without insight into why each item was selected.
5. **No Smart Nutritional Replacement**: When a user rejects a dish, the baseline cannot find an alternative that preserves exact macro balance while excluding the rejected item.
6. **No Health-Constraint Modes**: Lacks dedicated low-sodium, blood-sugar-conscious, or heart-conscious constraint tuning.

## Baseline Preservation in Proposed Project
The baseline recommender is maintained in [`src/recommendation/baselineRecommender.js`](file:///c:/Users/Loge/Desktop/RECOM%20SYS%20PROJECT/src/recommendation/baselineRecommender.js) and can be executed side-by-side with our proposed system in the **Benchmark & Comparison** module to empirically prove the improvements.
