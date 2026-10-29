# Testing Strategy & Automated Test Suite

## Overview
The application incorporates automated client-side testing covering:
1. **Anthropometric Math Unit Tests**: Mifflin-St Jeor BMR, TDEE, Calorie deficit/surplus, and Macro distribution.
2. **Hard Constraint Filter Tests**: Allergen zero-tolerance and dietary classification verification.
3. **Preference Learning Tests**: State mutation and weight adaptation upon interactive feedback.
4. **Smart Meal Replacement Tests**: Macro similarity scoring and delta validation.
5. **Diversity Engine Tests**: Intra-plan duplicate elimination.

## Automated Test Cases (In-Browser Test Suite)
- **Test 1**: BMI & BMR Calculation (Male, 70kg, 175cm, 25y $\rightarrow$ BMI 22.9, BMR 1674 kcal).
- **Test 2**: Hard Allergen Exclusion (Peanut allergy $\rightarrow$ strict removal of all peanut-containing recipes).
- **Test 3**: Preference Weight Reinforcement (Like on paneer meal $\rightarrow$ +0.25 weight on 'paneer').
- **Test 4**: Smart Meal Replacement (Rejection of 500 kcal lunch $\rightarrow$ returns close macro match with delta report).
- **Test 5**: Diversity Duplicate Penalization (Ensures no identical dishes within a single daily plan).

## Test Execution
Click **"Tests"** in the top navigation bar and click **"Run Test Suite"** to execute all assertions live in the browser.
