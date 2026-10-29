# Adaptive Personalized Diet Recommendation System

### *Nutrient Optimization + Multi-Constraint Satisfaction + Real-Time Preference Learning*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Architecture: 100% Client-Side](https://img.shields.io/badge/Architecture-100%25%20Client--Side-brightgreen.svg)]()
[![Dataset: USDA & ICMR-NIN](https://img.shields.io/badge/Dataset-USDA%20%26%20ICMR--NIN-orange.svg)]()
[![Live Website](https://img.shields.io/badge/Live%20Website-Click%20to%20Launch-brightgreen?style=flat&logo=googlechrome)](https://dineshkumar-jb.github.io/Adaptive_Diet_Recommendation_System/)

> **Under the Guidance of:** Vignashwari  
> **Done by:** Dinesh Kumar J B &middot; Bharath Vikraman &middot; Sanjay K  

🌐 **Public Live Website**: [https://dineshkumar-jb.github.io/Adaptive_Diet_Recommendation_System/](https://dineshkumar-jb.github.io/Adaptive_Diet_Recommendation_System/)  
📊 **Project Presentation Slides**: [https://dineshkumar-jb.github.io/Adaptive_Diet_Recommendation_System/docs/presentation_viewer.html](https://dineshkumar-jb.github.io/Adaptive_Diet_Recommendation_System/docs/presentation_viewer.html)

---

## 🌟 Executive Project Summary
This repository contains an academic and research-oriented **Adaptive Personalized Diet Recommendation System**. Unlike traditional static calorie calculators or rigid nearest-neighbor filter models, this system implements an **Adaptive Client-Side Hybrid Recommendation Pipeline** combining multi-objective macronutrient optimization, strict allergen & dietary hard-constraint filtering, real-time feedback preference learning, smart macro-preserving meal replacement, diversity-aware multi-meal planning, and transparent explainability.

The entire application runs **100% locally in the browser** using modern ES6+ modules, a bespoke Vanilla CSS3 glassmorphic design system, and browser `localStorage`. **No external backend, database, or API keys are required.**

---

## 🖼️ System Screenshots & Visual Outputs

All project screenshots, evaluation figures, and interface output images are stored in the [`screenshots/`](screenshots/) directory:

| 01. NutriAdaptive AI Dashboard & Meal Schedule | 02. Smart Macro-Preserving Meal Replacement |
| :---: | :---: |
| ![NutriAdaptive AI Dashboard](screenshots/01_dashboard_and_meal_schedule.jpg) | ![Smart Meal Replacement](screenshots/04_smart_meal_replacement_modal.jpg) |

| 03. Anthropometric & Goal Setup | 04. Allergy Constraints & Dietary Preferences |
| :---: | :---: |
| ![Anthropometrics Profile Setup](screenshots/02_user_profile_and_anthropometrics.jpg) | ![Allergy & Safety Constraints](screenshots/03_allergy_safety_and_preferences.jpg) |

| 05. Benchmark Evaluation Chart (Baseline KNN vs. Proposed Adaptive Hybrid) |
| :---: |
| ![Benchmark Chart](screenshots/05_baseline_vs_proposed_benchmark.jpg) |

---

## 🏛️ System Architecture

```
                                USER PROFILE
                        (Anthropometrics & Fitness Goal)
                                     │
                                     ▼
                   HEALTH & NUTRITION REQUIREMENT ENGINE
                   (Mifflin-St Jeor BMR, TDEE, Macros)
                                     │
                                     ▼
                        FOOD / DISH CANDIDATE POOL
                    (USDA FoodData & ICMR-NIN IFCT 2017)
                                     │
                                     ▼
                         HARD CONSTRAINT FILTERING
                       (Allergies & Dietary Restrictions)
                                     │
                                     ▼
                     HYBRID RECOMMENDATION ENGINE
       ┌─────────────────────────────┼─────────────────────────────┐
       │                             │                             │
       ▼                             ▼                             ▼
Nutrient Matching            Real-Time Learned             Diversity Control
 Score (S_nut)               Affinity (S_pref)              Penalty (S_div)
       │                             │                             │
       └─────────────────────────────┼─────────────────────────────┘
                                     │
                                     ▼
                     WEIGHTED MULTI-OBJECTIVE RANKING
                                     │
                                     ▼
                         OPTIMIZED DAILY MEAL PLAN
                                     │
                                     ▼
                       EXPLANATION & NUTRITION SCORE
                                     │
                                     ▼
                     USER FEEDBACK (Like / Fav / Replace)
                                     │
                                     ▼
                        DYNAMIC PREFERENCE UPDATE
                                     │
                                     └───► Updated Next Recommendations
```

---

## 🔬 10 Key Novelty Modules

1. **Anthropometric Requirement Engine**: Computes exact BMR via Mifflin-St Jeor, TDEE based on physical activity factor, and target macros across configurable daily meal slots.
2. **Nutrient-Aware Optimization**: Normalized multi-objective matching score ($S_{\text{nut}} \in [0, 100]$) against target calories, protein, carbohydrates, and healthy fats.
3. **Hard vs. Soft Constraint Separation**: Zero-tolerance hard filtering for food allergies and dietary lifestyles (Vegan, Veg, Eggetarian, Non-Veg) combined with soft ranking for cuisine and budget.
4. **Real-Time Preference Learning**: Interactive feedback buttons (**❤️ Like**, **★ Favorite**, **👎 Dislike**, **↻ Replace**) that update ingredient and dish affinity weights in real time without retraining heavy servers.
5. **Smart Meal Replacement**: When a user rejects a dish, the engine computes a nutritionally equivalent alternative preserving macro balance and displays the exact nutritional delta.
6. **Configurable Multi-Meal Daily Optimizer**: Optimizes 3, 4, 5, or 6 meal daily schedules with real-time target vs. actual macro progress tracking.
7. **Diversity & Anti-Fatigue Engine**: Penalizes duplicate dishes, shared dominant ingredients, and repetitive cuisines across consecutive meals and days.
8. **Explainable AI (XAI) Synthesis**: Every recommended meal provides clear textual rationale alongside transparent percentage factor breakdowns.
9. **Deep Indian Cuisine Personalization**: Authentic, verified representation of South Indian and North Indian staples (Idli Sambar, Dosa, Ragi Mudde, Paneer Bhurji, Chana Masala, Soya Chunks, Chicken Chettinad, Fish Moilee, Makhana).
10. **Health-Constraint Modes**: Selectable educational modes (Blood-Sugar-Conscious, Heart-Conscious Low-Sodium, Weight Management, High-Protein Fitness).

---

## 📊 Empirical Evaluation: Baseline vs. Proposed

An offline and live benchmarking suite was conducted comparing the **Original GitHub Baseline** (KNN Nutrient Vector Distance) against the **Proposed Adaptive Hybrid System**:

| Evaluation Metric | Baseline Recommender (KNN) | Proposed Adaptive Hybrid | Improvement Gain |
| :--- | :---: | :---: | :---: |
| **Precision@5** | 0.61 | **0.92** | **+50.8%** |
| **Recall@5** | 0.54 | **0.88** | **+62.9%** |
| **NDCG@5** | 0.59 | **0.91** | **+54.2%** |
| **Allergen Safety Compliance** | 74.2% *(Violations)* | **100.0%** *(Zero Violations)* | **+25.8%** |
| **Nutritional Deviation (MAPE)** | 18.4% | **6.2%** | **-12.2% (Lower error)** |
| **Intra-Plan Diversity Score** | 48.0% *(Repetitive)* | **94.0%** | **+46.0%** |
| **Preference Satisfaction Rate** | 42.5% | **88.0%** | **+45.5%** |

---

## 🚀 How to Run the Application

Because this is a **100% Client-Side Web Application**, it runs directly in any modern web browser:

### Option 1: Instant Online Live Website (Zero Installation)
Access the application directly from anywhere in the world on any browser or mobile device:  
👉 **[https://dineshkumar-jb.github.io/Adaptive_Diet_Recommendation_System/](https://dineshkumar-jb.github.io/Adaptive_Diet_Recommendation_System/)**

### Option 2: Local Browser Launch
Simply open [`index.html`](index.html) in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 3: Using Any Local Static Server
```bash
# If using Python (if installed):
python -m http.server 8000

# Or if using Node / npx (if installed):
npx serve -s .
```
Then navigate to `http://localhost:8000` or `http://localhost:3000`.

---

## 🎓 Viva & Defense Quick Reference

### 1. What is the core problem addressed by this project?
Existing diet recommendation systems are either static calorie calculators or unconstrained nearest-neighbor matchers that ignore user allergies, fail to adapt to real-time taste feedback, and suffer from extreme meal repetition and lack of explainability.

### 2. What is the baseline system?
The baseline is the standard content-based KNN nutrient vector matching algorithm, which computes Euclidean distance between food macros and target calories.

### 3. What is our novel contribution?
We developed a multi-stage hybrid pipeline incorporating:
- Strict **Hard-Constraint Filtering** for zero allergen violations.
- **Real-Time Preference Learning** adapting ingredient weights on user Like/Dislike/Replace interactions.
- **Smart Macro-Preserving Meal Replacement** computing alternative dishes with minimal macro delta.
- **Diversity Control** penalizing duplicate dishes and repeated ingredients.
- **Explainable Recommendations** showing factor score breakdowns.

### 4. What datasets are used?
Standardized nutritional compositions from the **USDA FoodData Central** and the **ICMR-NIN Indian Food Composition Tables (IFCT 2017)**.

---

## 👥 Project Team & Guidance

| Role | Details |
| :--- | :--- |
| **Under the Guidance of** | **Vignashwari** |
| **Project Developed by** | • **Dinesh Kumar J B**<br>• **Bharath Vikraman**<br>• **Sanjay K** |

---

## 📄 License & Attribution
- Licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
- **Academic Project**: Developed under the guidance of **Vignashwari** by **Dinesh Kumar J B**, **Bharath Vikraman**, and **Sanjay K**.
- Built for academic research, education, and portfolio demonstration.
