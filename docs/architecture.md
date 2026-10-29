# Frontend Application Architecture

## Architectural Philosophy
The application is engineered as a **100% Client-Side Single Page Application (SPA)** utilizing Modern ES6+ JavaScript modules, Vanilla CSS3 Design System with Glassmorphism, and responsive UI components.

## Directory Structure
```
RECOM SYS PROJECT/
├── index.html                   # Master SPA shell and semantic view containers
├── style.css                    # Tailored Design System (Glassmorphic, Harmony Palette, Dark/Light modes)
├── package.json                 # Project metadata, scripts, and static hosting configs
├── README.md                    # Comprehensive documentation and Viva presentation guide
├── src/
│   ├── types/
│   │   └── index.js             # Type definitions and interface contracts
│   ├── data/
│   │   ├── foods.js             # 120+ Curated, authentic food items with USDA & IFCT nutrition data
│   │   ├── sampleUsers.js       # Pre-configured demo profiles (Arun, Priya, Rohan)
│   │   └── baselineModel.js     # Standalone baseline KNN feature vectors
│   ├── recommendation/
│   │   ├── nutritionEngine.js   # BMR (Mifflin-St Jeor), TDEE, Macros, Calorie targets
│   │   ├── constraintEngine.js  # Hard filters (Allergies, Diets, Excluded Foods)
│   │   ├── preferenceEngine.js  # Real-Time Preference Learning & Reward Updates
│   │   ├── diversityEngine.js   # Intra-day & inter-day repetition penalties
│   │   ├── mealReplacementEngine.js # Macro-preserving smart meal alternative selector
│   │   ├── mealPlanEngine.js    # N-meal daily planner & 7-day visual weekly scheduler
│   │   ├── rankingEngine.js     # Hybrid multi-objective scoring & explainability generator
│   │   └── baselineRecommender.js # Preserved baseline KNN nutrient matcher
│   ├── evaluation/
│   │   └── benchmark.js         # Offline evaluation suite (Precision@K, Recall@K, NDCG, Deviation, Diversity)
│   ├── utils/
│   │   ├── storage.js           # LocalStorage state manager with schema fallback
│   │   └── formatters.js        # Nutrition meters, badge tags, and chart helpers
│   └── app.js                   # State manager, event router, tab controller, and reactive rendering
└── docs/
    ├── github-project-analysis.md
    ├── baseline.md
    ├── architecture.md
    ├── recommendation-engine.md
    ├── dataset.md
    ├── testing.md
    └── development-log.md
```

## Key Software Components

### 1. State Store (`src/utils/storage.js`)
Persists all runtime data into browser `localStorage` across page reloads:
- `app_profile`: User anthropometrics, goals, and nutrition targets.
- `app_preferences`: Liked ingredients, disliked items, favorite meals, allergy exclusions.
- `app_meal_plan`: Active daily meal schedule.
- `app_weekly_plan`: 7-Day generated plan with replacement history.
- `app_history`: Interactive logs of liked, disliked, replaced, and favorited meals.
- `app_weights`: Configurable weights for research tweaking.

### 2. Reactive Controller (`src/app.js`)
- Manages view transitions between:
  1. Landing View (`#landing-view`)
  2. Profile & Target Estimator (`#profile-view`)
  3. Dietary Preferences & Constraints (`#preferences-view`)
  4. Daily Meal Plan & Interactive Feedback (`#mealplan-view`)
  5. 7-Day Weekly Planner (`#weekly-view`)
  6. Nutrition Progress & Macro Analytics (`#nutrition-view`)
  7. History & Learned Preferences (`#history-view`)
  8. Research Benchmark & Baseline Comparison (`#benchmark-view`)
  9. Automated Test Suite Runner (`#tests-view`)
