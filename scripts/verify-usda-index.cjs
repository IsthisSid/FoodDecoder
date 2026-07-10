const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const rawDirectory = path.join(root, 'data', 'raw', 'usda')
const index = JSON.parse(fs.readFileSync(path.join(root, 'public', 'data', 'usda-food-index.json'), 'utf8'))
const datasets = [
  { file: 'FoodData_Central_foundation_food_json_2026-04-30.json', key: 'FoundationFoods', id: 'foundation', releaseDate: '2026-04-30' },
  { file: 'FoodData_Central_sr_legacy_food_json_2018-04.json', key: 'SRLegacyFoods', id: 'sr-legacy', releaseDate: '2018-04-01' },
  { file: 'surveyDownload.json', key: 'SurveyFoods', id: 'fndds', releaseDate: '2024-10-31' },
]
const nutrientIds = { calories: [1008, 2047, 2048], protein: [1003], carbohydrates: [1005], fat: [1004], fiber: [1079], sugar: [2000], sodium: [1093] }
const indexByKey = new Map(index.foods.map((food) => [`${food.source.id}:${food.id}`, food]))
const failures = []
let checked = 0

for (const dataset of datasets) {
  const foods = JSON.parse(fs.readFileSync(path.join(rawDirectory, dataset.file), 'utf8'))[dataset.key] ?? []
  for (const food of foods) {
    if (!food?.description || !food.foodNutrients?.length) continue
    checked += 1
    const indexed = indexByKey.get(`${dataset.id}:${food.fdcId ?? food.foodCode}`)
    if (!indexed) { failures.push(`Missing ${dataset.id}:${food.fdcId ?? food.foodCode}`); continue }
    if (indexed.name !== food.description) failures.push(`Name mismatch for ${indexed.id}`)
    if (indexed.source.releaseDate !== dataset.releaseDate) failures.push(`Release date mismatch for ${indexed.id}`)
    for (const [name, ids] of Object.entries(nutrientIds)) {
      const raw = food.foodNutrients.find((item) => ids.includes(Number(item.nutrient?.id ?? item.nutrientId)))?.amount
      const actual = indexed.nutrition[name]
      if (raw !== actual && !(raw === undefined && actual === undefined)) failures.push(`Nutrient mismatch for ${indexed.id}: ${name}`)
    }
  }
}

if (failures.length) { console.error(`USDA index verification failed (${failures.length} issues)\n${failures.slice(0, 20).join('\n')}`); process.exit(1) }
console.log(`USDA index verified: ${checked} records, names, source dates, and normalized nutrients match the raw datasets.`)
