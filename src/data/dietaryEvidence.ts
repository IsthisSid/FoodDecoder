export type DietaryProfile = 'milk' | 'egg' | 'peanut' | 'tree-nut' | 'sesame' | 'soy' | 'gluten' | 'fish' | 'shellfish' | 'lactose' | 'gerd'
export type EvidenceStatus = 'contains' | 'may-contain' | 'potential-trigger' | 'no-listed-ingredient' | 'unknown'

export type DietaryEvidence = {
  profile: DietaryProfile
  status: EvidenceStatus
  matchedText?: string
  reason: string
  source: { label: string; url?: string; reviewedDate: string }
}

export const dietaryProfiles: Array<{ id: DietaryProfile; label: string }> = [
  { id: 'milk', label: 'Milk allergy' }, { id: 'egg', label: 'Egg allergy' }, { id: 'peanut', label: 'Peanut allergy' },
  { id: 'tree-nut', label: 'Tree nut allergy' }, { id: 'sesame', label: 'Sesame allergy' }, { id: 'soy', label: 'Soy allergy' },
  { id: 'gluten', label: 'Gluten / celiac' }, { id: 'fish', label: 'Fish allergy' }, { id: 'shellfish', label: 'Shellfish allergy' },
  { id: 'lactose', label: 'Lactose intolerance' }, { id: 'gerd', label: 'GERD potential triggers' },
]

const labelSource = { label: 'USDA Branded Foods ingredient list', reviewedDate: '2026-04-30' }
const gerdSource = { label: 'NIDDK GERD dietary guidance', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults/eating-diet-nutrition', reviewedDate: '2026-07-10' }

const patterns: Record<Exclude<DietaryProfile, 'lactose' | 'gerd'>, RegExp> = {
  milk: /\b(milk|casein|whey|butter|cheese|cream|yogurt)\b/i, egg: /\b(egg|albumin|mayonnaise)\b/i, peanut: /\bpeanut\b/i,
  'tree-nut': /\b(almonds?|cashews?|walnuts?|pecans?|pistachios?|hazelnuts?|macadamias?|brazil nuts?|pine nuts?)\b/i, sesame: /\bsesame\b/i,
  soy: /\bsoy(?:bean)?\b/i, gluten: /\b(wheat|barley|rye|malt|triticale)\b/i, fish: /\b(fish|salmon|tuna|cod|anchovy|sardine|tilapia)\b/i,
  shellfish: /\b(shellfish|shrimp|prawn|crab|lobster|clam|mussel|oyster|scallop)\b/i,
}
const gerdPattern = /\b(tomato|citrus|orange|lemon|lime|grapefruit|coffee|caffeine|chocolate|mint|peppermint|alcohol|vinegar|chili|hot pepper)\b/i

function matchText(text: string, pattern: RegExp): string | undefined { return text.match(pattern)?.[0] }

export function evaluateIngredientEvidence(ingredients?: string): DietaryEvidence[] {
  if (!ingredients?.trim()) return dietaryProfiles.map((profile) => ({ profile: profile.id, status: 'unknown', reason: 'No ingredient or allergen statement is available in this record.', source: labelSource }))
  const precautionary = /\b(may contain|may be present|manufactured (?:in|on) (?:a )?(?:facility|equipment)|shared equipment)\b/i.test(ingredients)
  const listedIngredients = ingredients.split(/\b(?:may contain|may be present|manufactured (?:in|on) (?:a )?(?:facility|equipment)|shared equipment)\b/i)[0]
  const findings: DietaryEvidence[] = []
  for (const [profile, pattern] of Object.entries(patterns) as Array<[Exclude<DietaryProfile, 'lactose' | 'gerd'>, RegExp]>) {
    const listedMatch = matchText(listedIngredients, pattern)
    const precautionaryMatch = matchText(ingredients, pattern)
    findings.push(listedMatch ? { profile, status: 'contains', matchedText: listedMatch, reason: `Ingredient list includes “${listedMatch}”.`, source: labelSource } : precautionary && precautionaryMatch ? { profile, status: 'may-contain', matchedText: precautionaryMatch, reason: `Precautionary label wording mentions “${precautionaryMatch}”.`, source: labelSource } : { profile, status: 'no-listed-ingredient', reason: precautionary ? 'No matching ingredient is listed; precautionary cross-contact wording is present.' : 'No matching ingredient is listed.', source: labelSource })
  }
  const dairy = matchText(ingredients, patterns.milk)
  findings.push(dairy ? { profile: 'lactose', status: 'contains', matchedText: dairy, reason: `Milk-derived ingredient “${dairy}” is listed; lactose amount is not reported.`, source: labelSource } : { profile: 'lactose', status: 'no-listed-ingredient', reason: 'No milk-derived ingredient is listed; lactose content and cross-contact are not confirmed.', source: labelSource })
  const trigger = matchText(ingredients, gerdPattern)
  findings.push(trigger ? { profile: 'gerd', status: 'potential-trigger', matchedText: trigger, reason: `Ingredient “${trigger}” is in a category commonly linked to symptoms for some people with GERD.`, source: gerdSource } : { profile: 'gerd', status: 'unknown', reason: 'No supported potential-trigger ingredient was identified from this label.', source: gerdSource })
  return findings
}
