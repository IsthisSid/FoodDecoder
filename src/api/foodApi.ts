import { evaluateIngredientEvidence, type DietaryEvidence } from '../data/dietaryEvidence'

export type SearchMode = 'name' | 'barcode'
export type NutritionSnapshot = { nutritionBasis: '100g'; calories?: number; protein?: number; carbohydrates?: number; fat?: number; fiber?: number; sugar?: number; sodium?: number }
export type FoodSource = { id: 'foundation' | 'sr-legacy' | 'fndds' | 'branded'; label: string; releaseDate: string; publicationDate?: string; modifiedDate?: string }
export interface DecodedFood { id: string; barcode?: string; name: string; brand?: string; category?: string; ingredients?: string; nutrition: NutritionSnapshot; sources: FoodSource[]; commonPortion?: { description: string; grams: number }; dietaryEvidence: DietaryEvidence[] }
type LocalFood = Omit<DecodedFood, 'dietaryEvidence' | 'sources'> & { source: FoodSource; priority: number }
type LocalIndex = { generatedAt: string; foods: LocalFood[] }
type BrandedFood = Omit<DecodedFood, 'sources' | 'dietaryEvidence' | 'commonPortion'> & { servingSize?: number; servingUnit?: string; servingText?: string; source: FoodSource }

const asset = (file: string) => `${import.meta.env.BASE_URL}data/${file}`
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const canonicalBarcode = (value: string) => value.replace(/\D/g, '').replace(/^0+/, '') || '0'
function searchForms(query: string): string[] { const normalized = normalize(query); const singular = normalized.split(' ').map((token) => token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token).join(' '); return [...new Set([normalized, singular])] }
function matchScore(name: string, query: string): number { return Math.max(...searchForms(query).flatMap((target) => searchForms(name).map((candidate) => candidate === target ? 100 : candidate.startsWith(`${target} `) ? 85 : candidate.includes(target) ? 60 : target.split(' ').every((token) => candidate.includes(token)) ? target.split(' ').length * 15 : 0))) }
function barcodeShard(value: string): string { let hash = 2166136261; for (const char of value) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619) } return ((hash >>> 16) % 256).toString(16).padStart(2, '0') }

let indexPromise: Promise<LocalIndex> | undefined
async function loadIndex(): Promise<LocalIndex> { indexPromise ??= fetch(asset('usda-food-index.json')).then(async (response) => { if (!response.ok) throw new Error('The local USDA food index could not be loaded.'); return response.json() as Promise<LocalIndex> }); return indexPromise }
export function selectBestLocalFood(foods: LocalFood[], query: string): LocalFood | null { const queryTerms = normalize(query); const scored = foods.map((food) => { let score = matchScore(food.name, query) + food.priority * 2; const name = normalize(food.name); if (!queryTerms.includes('overripe') && name.includes('overripe')) score -= 10; if (!queryTerms.includes('overripe') && name.includes('ripe and slightly ripe')) score += 4; return { food, score } }).filter(({ score }) => score > 0); return scored.sort((left, right) => right.score - left.score)[0]?.food ?? null }

async function decodeBarcode(value: string): Promise<DecodedFood> {
  const barcode = canonicalBarcode(value); const shard = barcodeShard(value.replace(/\D/g, ''))
  const response = await fetch(asset(`branded/${shard}.json`)); if (!response.ok) throw new Error('The local branded-food index could not be loaded.')
  const product = (await response.json() as BrandedFood[]).find((item) => canonicalBarcode(item.barcode ?? '') === barcode)
  if (!product) throw new Error('No matching barcode was found in the local USDA Branded Foods release.')
  return { id: product.id, barcode: product.barcode, name: product.name, brand: product.brand, category: product.category, ingredients: product.ingredients, nutrition: { ...product.nutrition, nutritionBasis: '100g' }, sources: [product.source], commonPortion: product.servingSize ? { description: product.servingText || 'Label serving', grams: product.servingSize } : undefined, dietaryEvidence: evaluateIngredientEvidence(product.ingredients) }
}

export async function decodeFood(query: string, mode: SearchMode): Promise<DecodedFood> {
  const trimmed = query.trim(); if (!trimmed) throw new Error('Enter a food name or barcode.')
  if (mode === 'barcode' || /^\d{8,14}$/.test(trimmed)) return decodeBarcode(trimmed)
  const food = selectBestLocalFood((await loadIndex()).foods, trimmed); if (!food) throw new Error('No USDA food match found. Try a more specific food name.')
  return { id: food.id, name: food.name, category: food.category, nutrition: { ...food.nutrition, nutritionBasis: '100g' }, sources: [food.source], commonPortion: food.commonPortion, dietaryEvidence: evaluateIngredientEvidence() }
}
