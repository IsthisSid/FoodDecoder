export interface NutrientCardModel {
  key: string
  label: string
  value: string
  detail: string
}

export function formatNutritionValue(value?: number, unit = 'g'): string {
  if (value === undefined || Number.isNaN(value)) {
    return '—'
  }

  return `${Math.round(value * 10) / 10}${unit}`
}

export function getMacroCardModel(nutrition: Record<string, number | undefined>): NutrientCardModel[] {
  const entries: NutrientCardModel[] = [
    {
      key: 'calories',
      label: 'Calories',
      value: formatNutritionValue(nutrition.calories, ' kcal'),
      detail: nutrition.calories && nutrition.calories > 250 ? 'Higher energy' : nutrition.calories && nutrition.calories > 120 ? 'Moderate energy' : 'Lower energy',
    },
    {
      key: 'protein',
      label: 'Protein',
      value: formatNutritionValue(nutrition.protein),
      detail: nutrition.protein && nutrition.protein >= 15 ? 'High protein' : nutrition.protein && nutrition.protein >= 8 ? 'Moderate' : 'Lower protein',
    },
    {
      key: 'carbohydrates',
      label: 'Carbohydrates',
      value: formatNutritionValue(nutrition.carbohydrates),
      detail: nutrition.carbohydrates && nutrition.carbohydrates >= 20 ? 'Moderate' : 'Lower',
    },
    {
      key: 'fat',
      label: 'Fat',
      value: formatNutritionValue(nutrition.fat),
      detail: nutrition.fat && nutrition.fat >= 15 ? 'Higher fat' : nutrition.fat && nutrition.fat >= 8 ? 'Moderate' : 'Lower fat',
    },
    {
      key: 'fiber',
      label: 'Fiber',
      value: formatNutritionValue(nutrition.fiber),
      detail: nutrition.fiber && nutrition.fiber >= 5 ? 'Good fiber' : nutrition.fiber && nutrition.fiber >= 2 ? 'Some fiber' : 'Lower fiber',
    },
    {
      key: 'sugar',
      label: 'Sugar',
      value: formatNutritionValue(nutrition.sugar),
      detail: nutrition.sugar && nutrition.sugar >= 12 ? 'Higher sugar' : nutrition.sugar && nutrition.sugar >= 5 ? 'Moderate' : 'Lower sugar',
    },
    {
      key: 'sodium',
      label: 'Sodium',
      value: formatNutritionValue(nutrition.sodium, 'mg'),
      detail: nutrition.sodium && nutrition.sodium >= 600 ? 'Higher sodium' : nutrition.sodium && nutrition.sodium >= 250 ? 'Moderate' : 'Lower sodium',
    },
  ]

  return entries.filter((entry) => entry.value !== '—')
}
