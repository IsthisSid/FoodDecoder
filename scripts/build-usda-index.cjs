const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const rawDirectory = path.join(root, 'data', 'raw', 'usda')
const outputFile = path.join(root, 'public', 'data', 'usda-food-index.json')

const datasets = [
  { file: 'FoodData_Central_foundation_food_json_2026-04-30.json', key: 'FoundationFoods', id: 'foundation', label: 'USDA Foundation Foods', releaseDate: '2026-04-30', priority: 3 },
  { file: 'FoodData_Central_sr_legacy_food_json_2018-04.json', key: 'SRLegacyFoods', id: 'sr-legacy', label: 'USDA SR Legacy', releaseDate: '2018-04-01', priority: 2 },
  { file: 'surveyDownload.json', key: 'SurveyFoods', id: 'fndds', label: 'USDA FNDDS 2021–2023', releaseDate: '2024-10-31', priority: 1 },
]

const nutrientIds = { calories: [1008, 2047, 2048], protein: [1003], carbohydrates: [1005], fat: [1004], fiber: [1079], sugar: [2000], sodium: [1093] }

function nutrientValue(food, nutrientIds) {
  const nutrient = (food.foodNutrients ?? []).find((item) => nutrientIds.includes(Number(item.nutrient?.id ?? item.nutrientId)))
  return typeof nutrient?.amount === 'number' ? nutrient.amount : typeof nutrient?.value === 'number' ? nutrient.value : undefined
}

function normalizeFood(food, dataset) {
  const nutrients = Object.fromEntries(Object.entries(nutrientIds).flatMap(([name, ids]) => {
    const value = nutrientValue(food, ids)
    return value === undefined ? [] : [[name, value]]
  }))
  const portion = (food.foodPortions ?? []).find((item) => typeof item.gramWeight === 'number' && item.gramWeight > 0 && item.portionDescription)
  return {
    id: String(food.fdcId ?? food.foodCode),
    name: food.description,
    category: food.foodCategory?.description ?? food.wweiaFoodCategory?.wweiaFoodCategoryDescription,
    dataType: food.dataType ?? dataset.label,
    source: { id: dataset.id, label: dataset.label, releaseDate: dataset.releaseDate },
    priority: dataset.priority,
    nutrition: nutrients,
    commonPortion: portion ? { description: portion.portionDescription, grams: portion.gramWeight } : undefined,
  }
}

const foods = []
for (const dataset of datasets) {
  const sourcePath = path.join(rawDirectory, dataset.file)
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing dataset: ${sourcePath}`)
  const payload = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
  foods.push(...(payload[dataset.key] ?? []).filter((food) => food?.description && food.foodNutrients?.length).map((food) => normalizeFood(food, dataset)))
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, JSON.stringify({ generatedAt: new Date().toISOString(), foods }))
console.log(`Wrote ${foods.length} foods to ${path.relative(root, outputFile)}`)
