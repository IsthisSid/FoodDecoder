import { describe, expect, it } from 'vitest'
import { evaluateGenericFoodEvidence, evaluateIngredientEvidence } from './dietaryEvidence'

describe('dietary evidence snapshots', () => {
  it('classifies direct ingredient, precautionary, and trigger evidence deterministically', () => {
    const findings = evaluateIngredientEvidence('TOMATO PUREE, WHEY, WALNUTS. MAY CONTAIN SESAME.')
      .filter((finding) => ['milk', 'tree-nut', 'sesame', 'gluten', 'gerd'].includes(finding.profile))
      .map(({ profile, status, matchedText, reason, source }) => ({ profile, status, matchedText, reason, source: source.label }))

    expect(findings).toMatchSnapshot()
  })

  it('keeps generic-food allergy evidence unknown while surfacing cited GERD evidence', () => {
    const findings = evaluateGenericFoodEvidence('Tomato, roma', { label: 'USDA Foundation Foods', releaseDate: '2026-04-30' })
      .filter((finding) => ['milk', 'gluten', 'gerd'].includes(finding.profile))
      .map(({ profile, status, source }) => ({ profile, status, source: source.label }))

    expect(findings).toMatchSnapshot()
  })
})
