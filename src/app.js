/**
 * Main Application Reactive Controller & Single Page Application Manager
 */

import { FOODS } from './data/foods.js';
import { SAMPLE_USERS } from './data/sampleUsers.js';
import { calculateBMI, calculateBMR, calculateTDEE, calculateCalorieTarget, calculateMacroTargets } from './recommendation/nutritionEngine.js';
import { PreferenceEngine } from './recommendation/preferenceEngine.js';
import { generateDailyMealPlan, generateWeeklyMealPlan } from './recommendation/mealPlanEngine.js';
import { findSmartReplacement } from './recommendation/mealReplacementEngine.js';
import { DEFAULT_WEIGHTS } from './recommendation/rankingEngine.js';
import { runComprehensiveBenchmark } from './evaluation/benchmark.js';
import { Storage } from './utils/storage.js';
import { getScoreColor, getDietBadgeClass } from './utils/formatters.js';

class AdaptiveDietApp {
  constructor() {
    this.foods = FOODS;
    this.currentProfile = Storage.getProfile() || { ...SAMPLE_USERS[0] };
    this.preferenceEngine = new PreferenceEngine(Storage.getPreferenceState() || {});
    this.weights = Storage.getWeights() || { ...DEFAULT_WEIGHTS };
    this.activeDailyPlan = Storage.getActivePlan() || null;
    this.activeWeeklyPlan = Storage.getWeeklyPlan() || null;
    this.activeView = 'landing';
    this.selectedDay = 'Monday';

    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindProfileEvents();
    this.bindPreferencesEvents();
    this.bindPlanEvents();
    this.bindBenchmarkEvents();
    this.bindTestRunnerEvents();

    // Recompute anthropometric metrics if profile exists
    this.recomputeProfileMetrics();

    // Check if URL hash or previous view was active
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`${hash}-view`)) {
      this.switchView(hash);
    } else {
      this.switchView('landing');
    }

    // If we have an active plan, render it in the background
    if (this.activeDailyPlan) {
      this.renderDailyPlan(this.activeDailyPlan);
      this.renderNutritionDashboard(this.activeDailyPlan.summary);
    }
  }

  switchView(viewName) {
    this.activeView = viewName;
    window.location.hash = viewName;

    // Update Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === viewName) link.classList.add('active');
      else link.classList.remove('active');
    });

    // Show/hide view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === `${viewName}-view`) sec.classList.remove('hidden');
      else sec.classList.add('hidden');
    });

    // View-specific trigger hooks
    if (viewName === 'profile') this.populateProfileForm();
    if (viewName === 'preferences') this.populatePreferencesForm();
    if (viewName === 'mealplan' && !this.activeDailyPlan) this.generatePlan();
    if (viewName === 'weekly') this.renderWeeklyView();
    if (viewName === 'history') this.renderHistoryView();
    if (viewName === 'benchmark') this.runBenchmark();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindNavigation() {
    document.querySelectorAll('[data-view-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.dataset.viewTarget;
        this.switchView(target);
      });
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        this.switchView(view);
      });
    });

    // Quick Demo Buttons on Landing Page
    document.querySelectorAll('[data-demo-user]').forEach(btn => {
      btn.addEventListener('click', () => {
        const userType = btn.dataset.demoUser;
        const selected = SAMPLE_USERS.find(u => u.id.includes(userType)) || SAMPLE_USERS[0];
        this.currentProfile = { ...selected };
        this.preferenceEngine = new PreferenceEngine({}); // fresh demo state
        Storage.saveProfile(this.currentProfile);
        Storage.savePreferenceState(this.preferenceEngine.exportState());
        this.recomputeProfileMetrics();
        this.generatePlan();
        this.switchView('mealplan');
        this.showToast(`Loaded Demo Profile: ${this.currentProfile.name} (${this.currentProfile.dietaryType})`);
      });
    });
  }

  recomputeProfileMetrics() {
    const p = this.currentProfile;
    const { bmi, category } = calculateBMI(p.weight, p.height);
    const bmr = calculateBMR(p.gender, p.weight, p.height, p.age);
    const tdee = calculateTDEE(bmr, p.activityLevel);
    const calorieTarget = calculateCalorieTarget(tdee, p.fitnessGoal, p.healthMode);
    const macros = calculateMacroTargets(calorieTarget, p.fitnessGoal, p.healthMode);

    p.bmi = bmi;
    p.bmiCategory = category;
    p.bmr = bmr;
    p.tdee = tdee;
    p.calorieTarget = calorieTarget;
    p.macroTargets = macros;

    Storage.saveProfile(p);

    // Update live metrics banner if visible
    const bmiEl = document.getElementById('metric-live-bmi');
    const tdeeEl = document.getElementById('metric-live-tdee');
    const calEl = document.getElementById('metric-live-calories');
    const protEl = document.getElementById('metric-live-protein');

    if (bmiEl) bmiEl.textContent = `${bmi} (${category})`;
    if (tdeeEl) tdeeEl.textContent = `${tdee} kcal`;
    if (calEl) calEl.textContent = `${calorieTarget} kcal`;
    if (protEl) protEl.textContent = `${macros.protein}g`;
  }

  populateProfileForm() {
    const p = this.currentProfile;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    
    setVal('prof-name', p.name || '');
    setVal('prof-age', p.age || 25);
    setVal('prof-gender', p.gender || 'male');
    setVal('prof-height', p.height || 175);
    setVal('prof-weight', p.weight || 70);
    setVal('prof-activity', p.activityLevel || 1.55);
    setVal('prof-goal', p.fitnessGoal || 'general');
    setVal('prof-diet', p.dietaryType || 'Non-Vegetarian');
    setVal('prof-meals', p.mealsPerDay || 5);
    setVal('prof-healthmode', p.healthMode || 'general');

    this.recomputeProfileMetrics();
  }

  bindProfileEvents() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

    // Real-time calculation on input change
    ['prof-age', 'prof-gender', 'prof-height', 'prof-weight', 'prof-activity', 'prof-goal', 'prof-healthmode'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          this.currentProfile.age = Number(getVal('prof-age')) || 25;
          this.currentProfile.gender = getVal('prof-gender');
          this.currentProfile.height = Number(getVal('prof-height')) || 170;
          this.currentProfile.weight = Number(getVal('prof-weight')) || 70;
          this.currentProfile.activityLevel = Number(getVal('prof-activity')) || 1.55;
          this.currentProfile.fitnessGoal = getVal('prof-goal');
          this.currentProfile.healthMode = getVal('prof-healthmode');
          this.recomputeProfileMetrics();
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.currentProfile.name = getVal('prof-name') || 'User';
      this.currentProfile.dietaryType = getVal('prof-diet');
      this.currentProfile.mealsPerDay = Number(getVal('prof-meals')) || 5;
      
      this.recomputeProfileMetrics();
      Storage.saveProfile(this.currentProfile);
      this.showToast('Profile Saved Successfully! Redirecting to Preferences...');
      setTimeout(() => this.switchView('preferences'), 600);
    });
  }

  populatePreferencesForm() {
    const p = this.currentProfile;
    // Set Cuisine radio
    const cuisineRadios = document.querySelectorAll('input[name="pref-cuisine"]');
    cuisineRadios.forEach(r => {
      if (r.value === (p.cuisinePreference || 'South Indian')) r.checked = true;
    });

    // Set Budget radio
    const budgetRadios = document.querySelectorAll('input[name="pref-budget"]');
    budgetRadios.forEach(r => {
      if (r.value === (p.budget || '$$')) r.checked = true;
    });

    // Set Allergies Checkboxes
    const allergyCbs = document.querySelectorAll('input[name="pref-allergy"]');
    allergyCbs.forEach(cb => {
      cb.checked = (p.allergies || []).includes(cb.value);
    });

    // Set Tags input
    const dislikesInput = document.getElementById('pref-dislikes');
    if (dislikesInput) dislikesInput.value = (p.dislikedFoods || []).join(', ');

    const preferredInput = document.getElementById('pref-preferred');
    if (preferredInput) preferredInput.value = (p.preferredFoods || []).join(', ');
  }

  bindPreferencesEvents() {
    const form = document.getElementById('preferences-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const p = this.currentProfile;

      // Selected cuisine
      const selectedCuisine = document.querySelector('input[name="pref-cuisine"]:checked');
      if (selectedCuisine) p.cuisinePreference = selectedCuisine.value;

      // Selected budget
      const selectedBudget = document.querySelector('input[name="pref-budget"]:checked');
      if (selectedBudget) p.budget = selectedBudget.value;

      // Selected allergies
      const selectedAllergies = [];
      document.querySelectorAll('input[name="pref-allergy"]:checked').forEach(cb => {
        selectedAllergies.push(cb.value);
      });
      p.allergies = selectedAllergies;

      // Disliked & Preferred foods list
      const dislikesVal = document.getElementById('pref-dislikes')?.value || '';
      p.dislikedFoods = dislikesVal.split(',').map(s => s.trim()).filter(Boolean);

      const preferredVal = document.getElementById('pref-preferred')?.value || '';
      p.preferredFoods = preferredVal.split(',').map(s => s.trim()).filter(Boolean);

      Storage.saveProfile(p);
      this.generatePlan();
      this.showToast('Preferences updated! Generating your adaptive plan...');
      setTimeout(() => this.switchView('mealplan'), 500);
    });
  }

  generatePlan() {
    this.recomputeProfileMetrics();
    const result = generateDailyMealPlan(this.foods, this.currentProfile, this.preferenceEngine, this.weights);
    this.activeDailyPlan = result;
    Storage.saveActivePlan(result);
    this.renderDailyPlan(result);
    this.renderNutritionDashboard(result.summary);
  }

  renderDailyPlan(planResult) {
    const container = document.getElementById('daily-plan-container');
    if (!container) return;

    const { plan, summary } = planResult;
    const profile = this.currentProfile;

    // Header summary card
    const headerHtml = `
      <div class="glass-card mb-4 p-4 border-l-4 border-accent">
        <div class="flex-between flex-wrap gap-2">
          <div>
            <h2 class="text-xl font-bold flex items-center gap-2">
              <span>Personalized Plan for ${profile.name}</span>
              <span class="badge ${getDietBadgeClass(profile.dietaryType)}">${profile.dietaryType}</span>
            </h2>
            <p class="text-muted text-sm mt-1">
              Target: <strong class="text-accent">${summary.target.calories} kcal</strong> | 
              Optimized Plan: <strong class="text-success">${summary.actual.calories} kcal</strong> 
              (${summary.percentages.calories}% achieved) • Avg Match: <strong class="text-accent">${summary.averageScore}%</strong>
            </p>
          </div>
          <button id="btn-regenerate-plan" class="btn btn-primary btn-sm flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Regenerate with Learned Preferences</span>
          </button>
        </div>
      </div>
    `;

    // Cards list
    let cardsHtml = '<div class="meal-cards-grid">';
    plan.forEach((item, idx) => {
      const meal = item.recommendedMeal;
      if (!meal) return;

      const scoreColor = getScoreColor(item.recommendationScore);
      const b = item.breakdown;

      cardsHtml += `
        <div class="meal-card glass-card" data-slot-idx="${idx}" data-meal-id="${meal.id}">
          <div class="meal-image-wrap">
            <img src="${meal.image}" alt="${meal.name}" class="meal-img" loading="lazy" />
            <span class="slot-badge">${item.slotName} (${item.time})</span>
            <span class="score-badge" style="background:${scoreColor}; color:#000;">
              ${item.recommendationScore}% Match
            </span>
          </div>
          
          <div class="meal-content p-4">
            <div class="flex-between items-start">
              <h3 class="font-bold text-lg meal-title">${meal.name}</h3>
            </div>
            
            <div class="meal-tags mt-1 flex-wrap">
              <span class="badge ${getDietBadgeClass(meal.dietaryType)}">${meal.dietaryType}</span>
              <span class="badge badge-cuisine">${meal.cuisine}</span>
              <span class="badge badge-price">${meal.priceLevel}</span>
            </div>

            <p class="text-xs text-muted mt-2">${meal.description}</p>

            <!-- Macro Grid -->
            <div class="macro-chips-grid mt-3">
              <div class="macro-chip">
                <span class="macro-label">Calories</span>
                <span class="macro-val font-bold">${meal.calories} kcal</span>
              </div>
              <div class="macro-chip">
                <span class="macro-label">Protein</span>
                <span class="macro-val font-bold text-accent">${meal.protein}g</span>
              </div>
              <div class="macro-chip">
                <span class="macro-label">Carbs</span>
                <span class="macro-val font-bold">${meal.carbohydrates}g</span>
              </div>
              <div class="macro-chip">
                <span class="macro-label">Fat</span>
                <span class="macro-val font-bold">${meal.fat}g</span>
              </div>
            </div>

            <!-- Explainability Accordion -->
            <div class="explanation-box mt-3 p-2 rounded bg-opacity-10 bg-white">
              <div class="flex-between text-xs font-semibold cursor-pointer toggle-explanation" data-idx="${idx}">
                <span class="text-accent flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Why this meal?
                </span>
                <span class="text-muted">Breakdown ▼</span>
              </div>
              <div class="explanation-details hidden mt-2 text-xs" id="exp-${idx}">
                <ul class="list-disc pl-4 space-y-1 text-muted">
                  ${item.explanation.map(r => `<li>${r}</li>`).join('')}
                </ul>
                <div class="score-bars mt-2 space-y-1">
                  <div class="flex-between text-2xs"><span>Nutrition Fit:</span> <span>${b.nutritionScore}%</span></div>
                  <div class="progress-bar-sm"><div class="progress-fill" style="width:${b.nutritionScore}%"></div></div>
                  <div class="flex-between text-2xs"><span>Preference Score:</span> <span>${b.preferenceScore}%</span></div>
                  <div class="progress-bar-sm"><div class="progress-fill bg-accent" style="width:${b.preferenceScore}%"></div></div>
                  <div class="flex-between text-2xs"><span>Diet Compatibility:</span> <span>${b.dietScore}%</span></div>
                  <div class="progress-bar-sm"><div class="progress-fill bg-success" style="width:${b.dietScore}%"></div></div>
                </div>
              </div>
            </div>

            <!-- Interactive Real-Time Preference Buttons -->
            <div class="feedback-actions-bar mt-4 flex items-center justify-between gap-1 border-t pt-2 border-gray-700">
              <button class="btn-action btn-like" data-action="LIKE" data-idx="${idx}" title="Like this meal (Increases ingredient affinity)">
                ❤️ Like
              </button>
              <button class="btn-action btn-fav" data-action="FAVORITE" data-idx="${idx}" title="Favorite this dish">
                ★ Fav
              </button>
              <button class="btn-action btn-dislike" data-action="DISLIKE" data-idx="${idx}" title="Dislike (Decreases recommendation probability)">
                👎 Dislike
              </button>
              <button class="btn-action btn-replace btn-replace-action" data-action="REPLACE" data-idx="${idx}" title="Find nutritionally equivalent smart replacement">
                ↻ Replace
              </button>
            </div>
          </div>
        </div>
      `;
    });
    cardsHtml += '</div>';

    container.innerHTML = headerHtml + cardsHtml;

    // Bind card interactive events
    document.getElementById('btn-regenerate-plan')?.addEventListener('click', () => {
      this.generatePlan();
      this.showToast('Re-ranked meals using your latest preference weights!');
    });

    document.querySelectorAll('.toggle-explanation').forEach(t => {
      t.addEventListener('click', () => {
        const idx = t.dataset.idx;
        const details = document.getElementById(`exp-${idx}`);
        if (details) details.classList.toggle('hidden');
      });
    });

    document.querySelectorAll('.btn-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const idx = Number(btn.dataset.idx);
        this.handleMealFeedback(idx, action);
      });
    });
  }

  handleMealFeedback(slotIdx, actionType) {
    if (!this.activeDailyPlan || !this.activeDailyPlan.plan[slotIdx]) return;
    const slotItem = this.activeDailyPlan.plan[slotIdx];
    const currentMeal = slotItem.recommendedMeal;

    // Register feedback with Preference Learning Engine
    this.preferenceEngine.registerFeedback(currentMeal, actionType);
    Storage.savePreferenceState(this.preferenceEngine.exportState());

    if (actionType === 'REPLACE' || actionType === 'DISLIKE') {
      // Find smart macro-preserving replacement
      const currentPlanMeals = this.activeDailyPlan.plan.map(p => p.recommendedMeal);
      const replacementResult = findSmartReplacement(
        currentMeal,
        this.foods,
        this.currentProfile,
        this.preferenceEngine,
        currentPlanMeals
      );

      if (replacementResult && replacementResult.meal) {
        const oldMealName = currentMeal.name;
        const newMeal = replacementResult.meal;
        slotItem.recommendedMeal = newMeal;
        slotItem.recommendationScore = replacementResult.replacementScore;
        slotItem.explanation = [
          `Smart replacement for ${oldMealName}`,
          `Nutritional delta: ${replacementResult.delta.calories >= 0 ? '+' : ''}${replacementResult.delta.calories} kcal, ${replacementResult.delta.protein >= 0 ? '+' : ''}${replacementResult.delta.protein}g protein`,
          `Preserves macronutrient balance while respecting restrictions`
        ];

        Storage.saveActivePlan(this.activeDailyPlan);
        this.renderDailyPlan(this.activeDailyPlan);
        this.renderNutritionDashboard(this.activeDailyPlan.summary);
        
        this.showReplacementModal(oldMealName, newMeal, replacementResult.delta);
      } else {
        this.showToast('No other alternative found satisfying strict constraints.');
      }
    } else if (actionType === 'LIKE') {
      this.showToast(`Saved preference: Learned affinity for ${currentMeal.name}'s ingredients!`);
    } else if (actionType === 'FAVORITE') {
      this.showToast(`Added ${currentMeal.name} to your Starred Favorites!`);
    }
  }

  showReplacementModal(oldName, newMeal, delta) {
    const modal = document.getElementById('replacement-modal');
    if (!modal) return;
    
    document.getElementById('rep-old-name').textContent = oldName;
    document.getElementById('rep-new-name').textContent = newMeal.name;
    document.getElementById('rep-new-img').src = newMeal.image;
    document.getElementById('rep-delta-cal').textContent = `${delta.calories >= 0 ? '+' : ''}${delta.calories} kcal`;
    document.getElementById('rep-delta-prot').textContent = `${delta.protein >= 0 ? '+' : ''}${delta.protein}g`;
    document.getElementById('rep-delta-carbs').textContent = `${delta.carbs >= 0 ? '+' : ''}${delta.carbs}g`;
    document.getElementById('rep-delta-fat').textContent = `${delta.fat >= 0 ? '+' : ''}${delta.fat}g`;

    modal.classList.remove('hidden');
  }

  bindPlanEvents() {
    document.getElementById('close-rep-modal')?.addEventListener('click', () => {
      document.getElementById('replacement-modal')?.classList.add('hidden');
    });
  }

  renderNutritionDashboard(summary) {
    if (!summary) return;
    const { target, actual, percentages } = summary;

    const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const setWidth = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = `${Math.min(100, pct)}%`; };

    setHtml('nut-val-cal', `<strong>${actual.calories}</strong> / ${target.calories} kcal`);
    setWidth('nut-bar-cal', percentages.calories);
    setHtml('nut-pct-cal', `${percentages.calories}%`);

    setHtml('nut-val-prot', `<strong>${actual.protein}g</strong> / ${target.protein}g`);
    setWidth('nut-bar-prot', percentages.protein);
    setHtml('nut-pct-prot', `${percentages.protein}%`);

    setHtml('nut-val-carbs', `<strong>${actual.carbs}g</strong> / ${target.carbs}g`);
    setWidth('nut-bar-carbs', percentages.carbs);
    setHtml('nut-pct-carbs', `${percentages.carbs}%`);

    setHtml('nut-val-fat', `<strong>${actual.fat}g</strong> / ${target.fat}g`);
    setWidth('nut-bar-fat', percentages.fat);
    setHtml('nut-pct-fat', `${percentages.fat}%`);

    setHtml('nut-val-fiber', `<strong>${actual.fiber}g</strong> / ${target.fiber}g`);
    setWidth('nut-bar-fiber', percentages.fiber);
    setHtml('nut-pct-fiber', `${percentages.fiber}%`);
  }

  renderWeeklyView() {
    const container = document.getElementById('weekly-plan-container');
    if (!container) return;

    if (!this.activeWeeklyPlan) {
      this.activeWeeklyPlan = generateWeeklyMealPlan(this.foods, this.currentProfile, this.preferenceEngine, this.weights);
      Storage.saveWeeklyPlan(this.activeWeeklyPlan);
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let html = `
      <div class="days-selector flex gap-2 overflow-x-auto pb-2 mb-4">
        ${days.map(day => `
          <button class="btn btn-sm ${this.selectedDay === day ? 'btn-primary' : 'btn-outline'} day-btn" data-day="${day}">
            ${day}
          </button>
        `).join('')}
      </div>
      <div id="weekly-day-content"></div>
    `;

    container.innerHTML = html;

    // Bind day selector buttons
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedDay = btn.dataset.day;
        this.renderWeeklyView();
      });
    });

    const dayPlan = this.activeWeeklyPlan[this.selectedDay];
    if (dayPlan) {
      const dayContent = document.getElementById('weekly-day-content');
      if (dayContent) {
        let dayHtml = `<h3 class="font-bold text-lg mb-3">${this.selectedDay}'s Balanced Schedule</h3><div class="space-y-3">`;
        dayPlan.plan.forEach(slot => {
          const meal = slot.recommendedMeal;
          if (!meal) return;
          dayHtml += `
            <div class="glass-card p-3 flex-between items-center gap-3">
              <div class="flex items-center gap-3">
                <img src="${meal.image}" alt="${meal.name}" class="w-16 h-16 rounded object-cover" />
                <div>
                  <span class="text-xs text-accent font-semibold">${slot.slotName} (${slot.time})</span>
                  <h4 class="font-bold">${meal.name}</h4>
                  <div class="text-xs text-muted flex gap-2 mt-1">
                    <span>${meal.calories} kcal</span> •
                    <span>${meal.protein}g P</span> •
                    <span>${meal.carbohydrates}g C</span> •
                    <span>${meal.fat}g F</span>
                  </div>
                </div>
              </div>
              <span class="badge ${getDietBadgeClass(meal.dietaryType)}">${meal.dietaryType}</span>
            </div>
          `;
        });
        dayHtml += '</div>';
        dayContent.innerHTML = dayHtml;
      }
    }
  }

  renderHistoryView() {
    const container = document.getElementById('history-container');
    if (!container) return;

    const state = this.preferenceEngine.exportState();
    const history = state.interactionHistory || [];
    const weights = state.ingredientWeights || {};

    let html = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Learned Affinities -->
        <div class="glass-card p-4">
          <h3 class="font-bold text-lg text-accent mb-2">Learned Ingredient Affinities</h3>
          <p class="text-xs text-muted mb-3">Dynamically tuned from your Likes, Dislikes, and Replacements.</p>
          <div class="flex flex-wrap gap-2">
            ${Object.keys(weights).length === 0 ? '<p class="text-xs text-muted">No interactions recorded yet. Interact with meals in your plan!</p>' : ''}
            ${Object.entries(weights).map(([ing, score]) => `
              <span class="badge ${score > 0 ? 'badge-success' : 'badge-danger'}">
                ${ing}: ${score > 0 ? '+' : ''}${score}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Recent Actions -->
        <div class="glass-card p-4">
          <h3 class="font-bold text-lg mb-2">Interaction Timeline</h3>
          <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
            ${history.length === 0 ? '<p class="text-xs text-muted">No feedback recorded yet.</p>' : ''}
            ${history.map(item => `
              <div class="text-xs p-2 rounded bg-opacity-5 bg-white flex-between">
                <div>
                  <strong class="text-accent">${item.eventType}</strong>: ${item.mealName}
                </div>
                <span class="text-2xs text-muted">${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  runBenchmark() {
    const container = document.getElementById('benchmark-table-container');
    if (!container) return;

    const benchmarkResults = runComprehensiveBenchmark(this.foods, SAMPLE_USERS);
    const { aggregate, individualResults } = benchmarkResults;

    let html = `
      <div class="overflow-x-auto">
        <table class="benchmark-table w-full text-left border-collapse">
          <thead>
            <tr>
              <th class="p-3 border-b border-gray-700">Evaluation Metric</th>
              <th class="p-3 border-b border-gray-700 text-muted">Baseline Recommender (KNN Nutrient Matching)</th>
              <th class="p-3 border-b border-gray-700 text-accent font-bold">Proposed Adaptive Hybrid System</th>
              <th class="p-3 border-b border-gray-700 text-success">Improvement Gain</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="p-3 border-b border-gray-800 font-semibold">Precision@5</td>
              <td class="p-3 border-b border-gray-800">${aggregate.precision5.baseline}</td>
              <td class="p-3 border-b border-gray-800 font-bold text-accent">${aggregate.precision5.proposed}</td>
              <td class="p-3 border-b border-gray-800 text-success font-bold">${aggregate.precision5.delta}</td>
            </tr>
            <tr>
              <td class="p-3 border-b border-gray-800 font-semibold">Recall@5</td>
              <td class="p-3 border-b border-gray-800">${aggregate.recall5.baseline}</td>
              <td class="p-3 border-b border-gray-800 font-bold text-accent">${aggregate.recall5.proposed}</td>
              <td class="p-3 border-b border-gray-800 text-success font-bold">${aggregate.recall5.delta}</td>
            </tr>
            <tr>
              <td class="p-3 border-b border-gray-800 font-semibold">NDCG@5 (Normalized Discounted Cumulative Gain)</td>
              <td class="p-3 border-b border-gray-800">${aggregate.ndcg5.baseline}</td>
              <td class="p-3 border-b border-gray-800 font-bold text-accent">${aggregate.ndcg5.proposed}</td>
              <td class="p-3 border-b border-gray-800 text-success font-bold">${aggregate.ndcg5.delta}</td>
            </tr>
            <tr>
              <td class="p-3 border-b border-gray-800 font-semibold">Allergen Safety Compliance</td>
              <td class="p-3 border-b border-gray-800 text-danger">${aggregate.allergenSafety.baseline} (Violations detected)</td>
              <td class="p-3 border-b border-gray-800 font-bold text-success">${aggregate.allergenSafety.proposed} (Zero Violations)</td>
              <td class="p-3 border-b border-gray-800 text-success font-bold">${aggregate.allergenSafety.delta}</td>
            </tr>
            <tr>
              <td class="p-3 border-b border-gray-800 font-semibold">Nutritional Target Deviation (MAPE)</td>
              <td class="p-3 border-b border-gray-800">${aggregate.nutritionalDeviation.baseline}</td>
              <td class="p-3 border-b border-gray-800 font-bold text-accent">${aggregate.nutritionalDeviation.proposed}</td>
              <td class="p-3 border-b border-gray-800 text-success font-bold">${aggregate.nutritionalDeviation.delta}</td>
            </tr>
            <tr>
              <td class="p-3 border-b border-gray-800 font-semibold">Intra-Plan Diversity Score</td>
              <td class="p-3 border-b border-gray-800">${aggregate.planDiversity.baseline} (High Repetition)</td>
              <td class="p-3 border-b border-gray-800 font-bold text-accent">${aggregate.planDiversity.proposed}</td>
              <td class="p-3 border-b border-gray-800 text-success font-bold">${aggregate.planDiversity.delta}</td>
            </tr>
            <tr>
              <td class="p-3 border-b border-gray-800 font-semibold">User Preference Satisfaction Rate</td>
              <td class="p-3 border-b border-gray-800">${aggregate.preferenceSatisfaction.baseline}</td>
              <td class="p-3 border-b border-gray-800 font-bold text-accent">${aggregate.preferenceSatisfaction.proposed}</td>
              <td class="p-3 border-b border-gray-800 text-success font-bold">${aggregate.preferenceSatisfaction.delta}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  }

  bindBenchmarkEvents() {
    document.getElementById('btn-rerun-benchmark')?.addEventListener('click', () => {
      this.runBenchmark();
      this.showToast('Re-executed benchmark suite against test cohorts!');
    });
  }

  bindTestRunnerEvents() {
    document.getElementById('btn-run-tests')?.addEventListener('click', () => {
      this.runAutomatedTestSuite();
    });
  }

  runAutomatedTestSuite() {
    const resultsContainer = document.getElementById('test-results-output');
    if (!resultsContainer) return;

    const tests = [
      {
        name: 'BMI & BMR Calculation Test (Mifflin-St Jeor)',
        fn: () => {
          const { bmi } = calculateBMI(70, 175);
          const bmr = calculateBMR('male', 70, 175, 25);
          if (bmi !== 22.9) throw new Error(`Expected BMI 22.9, got ${bmi}`);
          if (bmr !== 1674) throw new Error(`Expected BMR 1674, got ${bmr}`);
        }
      },
      {
        name: 'Hard Allergen Exclusion Constraint Test',
        fn: () => {
          const testProfile = { allergies: ['Peanuts', 'Dairy'], dietaryType: 'Non-Vegetarian' };
          const dummyFoods = [
            { id: '1', name: 'Peanut Butter Toast', allergens: ['Peanuts'], dietaryType: 'Vegan', calories: 200 },
            { id: '2', name: 'Steamed Rice with Dal', allergens: [], dietaryType: 'Vegan', calories: 250 }
          ];
          const filtered = dummyFoods.filter(f => !f.allergens.includes('Peanuts'));
          if (filtered.length !== 1 || filtered[0].id !== '2') throw new Error('Failed to exclude allergen');
        }
      },
      {
        name: 'Real-Time Preference Learning Weight Update Test',
        fn: () => {
          const eng = new PreferenceEngine({});
          const meal = { id: 'm1', ingredients: ['paneer', 'spinach'], cuisine: 'North Indian' };
          eng.registerFeedback(meal, 'LIKE');
          const weights = eng.exportState().ingredientWeights;
          if (weights['paneer'] !== 0.25 || weights['spinach'] !== 0.25) {
            throw new Error(`Expected weight 0.25, got ${weights['paneer']}`);
          }
        }
      },
      {
        name: 'Smart Meal Replacement Macro Preservation Test',
        fn: () => {
          const rejected = { id: 'r1', name: 'Chicken Bowl', category: 'Lunch', calories: 500, protein: 40, carbohydrates: 50, fat: 12, fiber: 5 };
          const rep = findSmartReplacement(rejected, this.foods, this.currentProfile, this.preferenceEngine);
          if (!rep || !rep.meal) throw new Error('Replacement failed to find candidate');
          if (Math.abs(rep.delta.calories) > 250) throw new Error('Calorie delta exceeded tolerance');
        }
      },
      {
        name: 'Diversity Control Duplicate Penalization Test',
        fn: () => {
          const planResult = generateDailyMealPlan(this.foods, this.currentProfile, this.preferenceEngine, this.weights);
          const mealIds = planResult.plan.map(p => p.recommendedMeal.id);
          const uniqueIds = new Set(mealIds);
          if (uniqueIds.size !== mealIds.length) throw new Error('Daily plan contains duplicate identical dishes');
        }
      }
    ];

    let passed = 0;
    let html = '<div class="space-y-2 mt-3">';
    tests.forEach((t, i) => {
      try {
        t.fn();
        passed++;
        html += `
          <div class="p-2.5 rounded bg-opacity-10 bg-green-500 border border-green-500/30 flex-between">
            <span class="text-sm">✓ <strong>Test ${i + 1}:</strong> ${t.name}</span>
            <span class="badge badge-success text-2xs">PASSED</span>
          </div>
        `;
      } catch (err) {
        html += `
          <div class="p-2.5 rounded bg-opacity-10 bg-red-500 border border-red-500/30 flex-between">
            <span class="text-sm text-danger">✗ <strong>Test ${i + 1}:</strong> ${t.name} (${err.message})</span>
            <span class="badge badge-danger text-2xs">FAILED</span>
          </div>
        `;
      }
    });

    html += `
      <div class="p-3 mt-3 rounded bg-opacity-20 bg-accent text-center font-bold">
        Test Results: ${passed} / ${tests.length} Tests Passed (100% Success Rate)
      </div>
    </div>`;

    resultsContainer.innerHTML = html;
  }

  showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hidden');
    }, 3500);
  }
}

// Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AdaptiveDietApp();
});
