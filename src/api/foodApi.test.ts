import { afterEach, describe, expect, it, vi } from 'vitest'
import { decodeFood, selectBestLocalFood } from './foodApi'

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

  it('explains that barcode lookup is outside the generic USDA dataset', async () => {
    await expect(decodeFood('012345678901', 'barcode')).rejects.toThrow('Barcode lookup is not available')
  })
})
