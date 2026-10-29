# Proposed Adaptive Recommendation Engine Architecture & Formulations

## System Overview
The proposed system is an **Adaptive Hybrid Multi-Constraint Recommender** operating 100% on the client side. It combines:
1. Multi-objective Nutritional Target Optimization
2. Strict Allergen and Dietary Hard-Constraint Filtering
3. Real-Time Preference Learning with Exponential Feedback Reinforcement
4. Multi-Constraint Soft Factor Scoring (Cuisine, Budget, Health Mode)
5. Diversity Control via Intra-List and History Penalty Functions
6. Smart Macro-Preserving Meal Replacement
7. Explainability Breakdown Synthesis

---

## Complete Recommendation Pipeline
```
                    ┌─────────────────────────┐
                    │      User Profile       │
                    │ (Anthropometrics, Goal) │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Nutrition Engine (Mifflin│
                    │  St-Jeor + Goal Factor) │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Target Macro Vectors   │
                    │  [Cal, Prot, Carb, Fat] │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Candidate Food Catalog  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Hard Constraint Filter  │
                    │ (Allergens, Diet, Disl.)│
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Hybrid Scoring Engine  │
                    │ ─────────────────────── │
                    │ • Nutrition Score (S_nut│
                    │ • Preference Score(S_prf│
                    │ • Diet Compat (S_diet)  │
                    │ • Cuisine Match (S_cui) │
                    │ • Diversity Score(S_div)│
                    │ • Budget Match (S_bud)  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Weighted Ranking & Top-K│
                    │  Meal Plan Construction │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Explainability Synthesis│
                    │  & Transparent Metrics  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ User Feedback & Dynamic │
                    │ Preference Learning Loop│
                    └─────────────────────────┘
```

---

## Mathematical Formulations

### 1. Basal Metabolic Rate (BMR) & Total Daily Energy Expenditure (TDEE)
Using the validated Mifflin-St Jeor equation:
$$\text{BMR}_{\text{male}} = 10 \cdot W_{\text{kg}} + 6.25 \cdot H_{\text{cm}} - 5 \cdot A_{\text{years}} + 5$$
$$\text{BMR}_{\text{female}} = 10 \cdot W_{\text{kg}} + 6.25 \cdot H_{\text{cm}} - 5 \cdot A_{\text{years}} - 161$$

$$\text{TDEE} = \text{BMR} \times \alpha_{\text{activity}}$$
where $\alpha_{\text{activity}} \in \{1.20 \text{ (Sedentary)}, 1.375 \text{ (Light)}, 1.55 \text{ (Moderate)}, 1.725 \text{ (Very Active)}, 1.90 \text{ (Extra Active)}\}$.

### 2. Goal-Based Calorie & Macro Target Allocation
$$\text{Calorie Target} = \text{TDEE} + \Delta_{\text{goal}}$$
where $\Delta_{\text{goal}} = -500 \text{ kcal}$ (Weight Loss), $0 \text{ kcal}$ (Maintenance), $+400 \text{ kcal}$ (Muscle Gain / Surplus).

Macro Splits:
- **High Protein / Muscle Gain**: 30% Protein, 45% Carbs, 25% Fat
- **Weight Loss / Cutting**: 35% Protein, 40% Carbs, 25% Fat
- **General Healthy / Maintenance**: 25% Protein, 50% Carbs, 25% Fat
- **Blood-Sugar Conscious**: 30% Protein, 35% Carbs (low GI/high fiber), 35% Fat
- **Heart Conscious**: 25% Protein, 55% Carbs, 20% Fat (low saturated fat, low sodium)

### 3. Nutrition Matching Score ($S_{\text{nut}}$)
For each meal slot with target vector $\mathbf{t} = [c_t, p_t, k_t, f_t]^T$ and candidate meal $\mathbf{m} = [c_m, p_m, k_m, f_m]^T$:
$$S_{\text{nut}}(m, t) = 100 \times \left( 1 - \frac{1}{4} \left( \frac{|c_m - c_t|}{c_t} + \frac{|p_m - p_t|}{p_t} + \frac{|k_m - k_t|}{k_t} + \frac{|f_m - f_t|}{f_t} \right) \right)$$
clamped in $[0, 100]$.

### 4. Real-Time Preference Learning Score ($S_{\text{pref}}$)
Let $\mathcal{I}_m$ be the set of ingredients and tags of meal $m$. The user preference state maintains ingredient weights $w(i) \in [-1.0, 1.0]$ initialized to $0.0$.
Upon user feedback event $e$:
- **Like / Favorite**: $w(i) \leftarrow \min(1.0, w(i) + \eta_{\text{like}})$ ($\eta_{\text{like}} = +0.25$, Favorite: $+0.40$)
- **Dislike / Replace**: $w(i) \leftarrow \max(-1.0, w(i) - \eta_{\text{dislike}})$ ($\eta_{\text{dislike}} = -0.35$)
- **Explicit Disliked Food**: $w(i) = -1.0$ (Hard exclude or max penalty)

$$S_{\text{pref}}(m) = 50 + 50 \times \left( \frac{1}{|\mathcal{I}_m|} \sum_{i \in \mathcal{I}_m} w(i) \right)$$

### 5. Diversity Penalty & Intra-List Variety Score ($S_{\text{div}}$)
To eliminate repetitive meal suggestions across consecutive days and meals:
$$S_{\text{div}}(m, \mathcal{H}) = 100 \times \prod_{h \in \mathcal{H}} \left( 1 - \gamma \cdot \text{JaccardOverlap}(m, h) \right)$$
where $\mathcal{H}$ is the set of meals already chosen today / in recent history, and $\gamma = 0.65$.

### 6. Hybrid Multi-Factor Ranking Formulation
$$\text{FinalScore}(m) = w_1 S_{\text{nut}} + w_2 S_{\text{pref}} + w_3 S_{\text{diet}} + w_4 S_{\text{cui}} + w_5 S_{\text{div}} + w_6 S_{\text{bud}}$$
where $\sum_{j=1}^6 w_j = 1.0$, with default balanced parameters:
$$w_1 = 0.35, \quad w_2 = 0.25, \quad w_3 = 0.15, \quad w_4 = 0.10, \quad w_5 = 0.10, \quad w_6 = 0.05$$
All weights are configurable by the user or researcher in the Developer & Settings panel.

### 7. Smart Meal Replacement Formulation
Given a rejected meal $m_{\text{old}}$, the replacement engine searches candidate set $\mathcal{C}_{\text{allowed}} = \mathcal{F} \setminus (\{m_{\text{old}}\} \cup \mathcal{E}_{\text{disliked}} \cup \mathcal{A}_{\text{allergic}})$:
$$m^* = \arg\min_{m \in \mathcal{C}_{\text{allowed}}} \left( \alpha \| \mathbf{x}_m - \mathbf{x}_{m_{\text{old}}} \|_2 + \beta (100 - S_{\text{pref}}(m)) \right)$$
subject to same meal slot category (e.g. Breakfast $\rightarrow$ Breakfast) and zero hard constraint violations.
