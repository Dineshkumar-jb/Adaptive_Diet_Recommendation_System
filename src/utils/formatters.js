/**
 * Formatting and UI Helper Utilities
 */

export function getScoreColor(score) {
  if (score >= 85) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 50) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

export function getDietBadgeClass(dietaryType) {
  switch (dietaryType) {
    case 'Vegan': return 'badge-vegan';
    case 'Vegetarian': return 'badge-veg';
    case 'Eggetarian': return 'badge-egg';
    default: return 'badge-nonveg';
  }
}

export function formatMacro(grams, totalGrams) {
  if (!totalGrams || totalGrams === 0) return `${grams}g`;
  const pct = Math.round((grams / totalGrams) * 100);
  return `${grams}g (${pct}%)`;
}
