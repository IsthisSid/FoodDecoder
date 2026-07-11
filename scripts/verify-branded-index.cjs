const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const directory = path.join(root, 'public', 'data', 'branded')
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'))

function shardFor(value) {
  let hash = 2166136261
  for (const char of value) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 16) % 256).toString(16).padStart(2, '0')
}

const failures = []
let total = 0
for (const [shard, expected] of Object.entries(manifest.shards)) {
  const file = path.join(directory, `${shard}.json`)
  if (!fs.existsSync(file)) { failures.push(`Missing shard ${shard}`); continue }
  const products = JSON.parse(fs.readFileSync(file, 'utf8'))
  const seen = new Set()
  if (products.length !== expected.count) failures.push(`Count mismatch for ${shard}`)
  for (const product of products) {
    if (!/^\d{8,14}$/.test(product.barcode ?? '')) failures.push(`Invalid barcode in ${shard}`)
    if (shardFor(product.barcode) !== shard) failures.push(`Shard mismatch for ${product.barcode}`)
    if (seen.has(product.barcode)) failures.push(`Duplicate barcode ${product.barcode}`)
    if (!product.ingredients?.trim()) failures.push(`Missing ingredients for ${product.barcode}`)
    if (product.source?.id !== 'branded' || product.source?.releaseDate !== manifest.source.releaseDate) failures.push(`Source mismatch for ${product.barcode}`)
    seen.add(product.barcode)
  }
  total += products.length
}

if (failures.length) {
  console.error(`Branded index verification failed (${failures.length} issues)\n${failures.slice(0, 20).join('\n')}`)
  process.exit(1)
}
console.log(`Branded index verified: ${total} unique barcode records across ${Object.keys(manifest.shards).length} shards.`)
