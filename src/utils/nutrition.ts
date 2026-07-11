export interface NutrientCardModel { key: string; label: string; value: string; detail: string }
export function formatNutritionValue(value?: number, unit = 'g'): string { return value === undefined || Number.isNaN(value) ? '—' : `${Math.round(value * 10) / 10}${unit}` }
export function getMacroCardModel(nutrition: Record<string, number | undefined>): NutrientCardModel[] { return [
  ['calories', 'Calories', formatNutritionValue(nutrition.calories, ' kcal')], ['protein', 'Protein', formatNutritionValue(nutrition.protein)], ['carbohydrates', 'Carbohydrates', formatNutritionValue(nutrition.carbohydrates)], ['fat', 'Fat', formatNutritionValue(nutrition.fat)], ['fiber', 'Fiber', formatNutritionValue(nutrition.fiber)], ['sugar', 'Sugar', formatNutritionValue(nutrition.sugar)], ['sodium', 'Sodium', formatNutritionValue(nutrition.sodium, 'mg')],
].map(([key, label, value]) => ({ key, label, value, detail: '' })).filter((entry) => entry.value !== '—') }
