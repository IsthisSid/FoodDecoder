const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { StringDecoder } = require('string_decoder')

const root = path.resolve(__dirname, '..')
const input = path.join(root, 'data', 'raw', 'usda', 'FoodData_Central_branded_food_json_2026-04-30.json')
const output = path.join(root, 'public', 'data', 'branded')
const temporary = path.join(root, 'data', 'tmp', 'branded')
const shardCount = 256

function hash(value) { let hash = 2166136261; for (const char of value) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619) } return (hash >>> 16) % shardCount }
function shardName(code) { return code.toString(16).padStart(2, '0') }
function nutrition(food) { const values = {}; for (const [key, id] of Object.entries({ calories: 1008, protein: 1003, carbohydrates: 1005, fat: 1004, fiber: 1079, sugar: 2000, sodium: 1093 })) { const amount = food.foodNutrients?.find((item) => item.nutrient?.id === id)?.amount; if (typeof amount === 'number') values[key] = amount } return values }
function normalize(food) {
  const barcode = String(food.gtinUpc ?? '').replace(/\D/g, '')
  if (barcode.length < 8 || barcode.length > 14 || !food.ingredients?.trim()) return null
  return { barcode, id: String(food.fdcId), name: food.description, brand: food.brandOwner, category: food.brandedFoodCategory, ingredients: food.ingredients, nutrition: nutrition(food), servingSize: food.servingSize, servingUnit: food.servingSizeUnit, servingText: food.householdServingFullText, source: { id: 'branded', label: 'USDA Branded Foods', releaseDate: '2026-04-30', publicationDate: food.publicationDate, modifiedDate: food.modifiedDate } }
}
async function streamObjects(onObject) {
  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder('utf8'); let arrayStarted = false; let collecting = false; let depth = 0; let quoted = false; let escaped = false; let object = ''
    const stream = fs.createReadStream(input)
    stream.on('data', (chunk) => { const text = decoder.write(chunk); for (const char of text) { if (!arrayStarted) { if (char === '[') arrayStarted = true; continue } if (!collecting) { if (char === '{') { collecting = true; depth = 1; object = '{'; quoted = false; escaped = false } continue } object += char; if (quoted) { if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === '"') quoted = false; continue } if (char === '"') quoted = true; else if (char === '{') depth += 1; else if (char === '}') { depth -= 1; if (depth === 0) { collecting = false; onObject(JSON.parse(object)); object = '' } } } })
    stream.on('end', () => { decoder.end(); resolve() }); stream.on('error', reject)
  })
}
async function main() {
  if (!fs.existsSync(input)) throw new Error(`Missing branded dataset: ${input}`)
  fs.rmSync(temporary, { recursive: true, force: true }); fs.mkdirSync(temporary, { recursive: true }); fs.mkdirSync(output, { recursive: true })
  const writers = Array.from({ length: shardCount }, (_, code) => fs.createWriteStream(path.join(temporary, `${shardName(code)}.ndjson`)))
  let accepted = 0
  await streamObjects((food) => { const product = normalize(food); if (!product) return; writers[hash(product.barcode)].write(`${JSON.stringify(product)}\n`); accepted += 1 })
  await Promise.all(writers.map((writer) => new Promise((resolve) => writer.end(resolve))))
  const manifest = { generatedAt: new Date().toISOString(), source: { label: 'USDA Branded Foods', releaseDate: '2026-04-30' }, shardCount, productsRead: accepted, shards: {} }
  for (let code = 0; code < shardCount; code += 1) {
    const name = shardName(code); const latest = new Map(); const lines = readline.createInterface({ input: fs.createReadStream(path.join(temporary, `${name}.ndjson`)), crlfDelay: Infinity })
    for await (const line of lines) { const product = JSON.parse(line); const current = latest.get(product.barcode); if (!current || String(product.source.publicationDate ?? '') > String(current.source.publicationDate ?? '')) latest.set(product.barcode, product) }
    const items = [...latest.values()]; const target = path.join(output, `${name}.json`); fs.writeFileSync(target, JSON.stringify(items)); manifest.shards[name] = { count: items.length, bytes: fs.statSync(target).size }
  }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2)); fs.rmSync(temporary, { recursive: true, force: true })
  console.log(`Built ${Object.values(manifest.shards).reduce((total, shard) => total + shard.count, 0)} unique barcode records across ${shardCount} shards.`)
}
main().catch((error) => { console.error(error); process.exit(1) })
