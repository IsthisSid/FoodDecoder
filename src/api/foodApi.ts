export type SearchMode = 'name' | 'barcode'
export type NutritionSnapshot = { nutritionBasis: '100g'; calories?: number; protein?: number; carbohydrates?: number; fat?: number; fiber?: number; sugar?: number; sodium?: number }
export type DietaryKey = 'vegetarian' | 'vegan' | 'dairyFree' | 'glutenFree' | 'eggFree' | 'soyFree'
export type FoodSource = { id: 'foundation' | 'sr-legacy' | 'fndds'; label: string; releaseDate: string }
export interface DietaryResult { tags: Record<DietaryKey, boolean | undefined>; allergens: string[]; ingredientsOfInterest: string[]; highlyProcessed: boolean }
export interface DecodedFood { id: string; name: string; category?: string; nutrition: NutritionSnapshot; dietary: DietaryResult; sources: FoodSource[]; commonPortion?: { description: string; grams: number } }
type LocalFood = Omit<DecodedFood, 'dietary' | 'sources'> & { source: FoodSource; priority: number }
type LocalIndex = { generatedAt: string; foods: LocalFood[] }

export function evaluateDietaryRules(ingredients: string[]): DietaryResult {
  // USDA generic records normally do not include an ingredient declaration; absence is unknown, never safe.
  if (!ingredients.length) return { tags: { vegetarian: undefined, vegan: undefined, dairyFree: undefined, glutenFree: undefined, eggFree: undefined, soyFree: undefined }, allergens: [], ingredientsOfInterest: [], highlyProcessed: false }
  return { tags: { vegetarian: undefined, vegan: undefined, dairyFree: undefined, glutenFree: undefined, eggFree: undefined, soyFree: undefined }, allergens: [], ingredientsOfInterest: [], highlyProcessed: false }
}

let indexPromise: Promise<LocalIndex> | undefined
async function loadIndex(): Promise<LocalIndex> {
  indexPromise ??= fetch('/data/usda-food-index.json').then(async (response) => {
    if (!response.ok) throw new Error('The local USDA food index could not be loaded.')
    return response.json() as Promise<LocalIndex>
  })
  return indexPromise
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
function searchForms(query: string): string[] { const normalized = normalize(query); const singular = normalized.split(' ').map((token) => token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token).join(' '); return [...new Set([normalized, singular])] }
function matchScore(name: string, query: string): number {
  return Math.max(...searchForms(query).flatMap((target) => searchForms(name).map((candidate) => {
    if (!target || !candidate) return 0
    if (candidate === target) return 100
    if (candidate.startsWith(`${target} `)) return 85
    if (candidate.includes(target)) return 60
    const tokens = target.split(' ')
    return tokens.every((token) => candidate.includes(token)) ? tokens.length * 15 : 0
  })))
}
export function selectBestLocalFood(foods: LocalFood[], query: string): LocalFood | null {
  const queryTerms = normalize(query)
  const scored = foods.map((food) => {
    let score = matchScore(food.name, query) + food.priority * 2
    const name = normalize(food.name)
    // A plain fruit query should not default to an unusually ripe variant.
    if (!queryTerms.includes('overripe') && name.includes('overripe')) score -= 10
    if (!queryTerms.includes('overripe') && name.includes('ripe and slightly ripe')) score += 4
    return { food, score }
  }).filter(({ score }) => score > 0)
  return scored.sort((left, right) => right.score - left.score)[0]?.food ?? null
}
export async function decodeFood(query: string, mode: SearchMode): Promise<DecodedFood> {
  const trimmed = query.trim()
  if (!trimmed) throw new Error('Enter a food name.')
  if (mode === 'barcode' || /^\d{6,14}$/.test(trimmed)) throw new Error('Barcode lookup is not available in the local USDA generic-food dataset yet.')
  const food = selectBestLocalFood((await loadIndex()).foods, trimmed)
  if (!food) throw new Error('No USDA food match found. Try a more specific food name.')
  return { id: food.id, name: food.name, category: food.category, nutrition: { ...food.nutrition, nutritionBasis: '100g' }, dietary: evaluateDietaryRules([]), sources: [food.source], commonPortion: food.commonPortion }
}
