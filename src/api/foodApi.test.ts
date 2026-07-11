import { afterEach, describe, expect, it, vi } from 'vitest'
import { decodeFood, selectBestLocalFood } from './foodApi'
import { evaluateIngredientEvidence } from '../data/dietaryEvidence'

afterEach(() => vi.unstubAllGlobals())

const source = { id: 'foundation' as const, label: 'USDA Foundation Foods', releaseDate: '2026-04-30' }
const foods = [
  { id: '1', name: 'Apple sauce, canned', nutrition: { nutritionBasis: '100g' as const, calories: 68 }, source: { id: 'sr-legacy' as const, label: 'USDA SR Legacy', releaseDate: '2018-04-01' }, priority: 2 },
  { id: '2', name: 'Apples, raw, with skin', nutrition: { nutritionBasis: '100g' as const, calories: 52 }, source, priority: 3 },
]

describe('selectBestLocalFood', () => {
  it('matches plural queries and favors the newer Foundation record', () => {
    expect(selectBestLocalFood(foods, 'apples')?.name).toBe('Apples, raw, with skin')
  })

  it('does not default a plain banana search to the overripe variant', () => {
    const bananas = [
      { id: '3', name: 'Bananas, overripe, raw', nutrition: { nutritionBasis: '100g' as const, calories: 85 }, source, priority: 3 },
      { id: '4', name: 'Bananas, ripe and slightly ripe, raw', nutrition: { nutritionBasis: '100g' as const, calories: 97 }, source, priority: 3 },
    ]
    expect(selectBestLocalFood(bananas, 'bananas')?.name).toBe('Bananas, ripe and slightly ripe, raw')
  })
})

describe('decodeFood', () => {
  it('returns the local USDA source and release date', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ generatedAt: '2026-07-10T00:00:00.000Z', foods }) }))
    await expect(decodeFood('apple', 'name')).resolves.toMatchObject({ name: 'Apples, raw, with skin', sources: [source] })
  })

  it('finds a local branded barcode record and provides ingredient evidence', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ([{ id: '100', barcode: '012345678901', name: 'Test granola', ingredients: 'OATS, WALNUTS, WHEY', nutrition: { calories: 400 }, source: { id: 'branded', label: 'USDA Branded Foods', releaseDate: '2026-04-30', publicationDate: '2026-04-01' } }]) }))
    await expect(decodeFood('012345678901', 'barcode')).resolves.toMatchObject({ name: 'Test granola', barcode: '012345678901' })
  })
})

describe('ingredient evidence', () => {
  it('reports declared ingredients without claiming cross-contact safety', () => {
    const evidence = evaluateIngredientEvidence('OATS, WALNUTS, WHEY')
    expect(evidence.find((item) => item.profile === 'milk')?.status).toBe('contains')
    expect(evidence.find((item) => item.profile === 'tree-nut')?.status).toBe('contains')
    expect(evidence.find((item) => item.profile === 'gluten')?.status).toBe('no-listed-ingredient')
  })
})
