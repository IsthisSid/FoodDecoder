# Data governance

## Source hierarchy

1. USDA Branded Foods ingredient statement for exact barcode matches.
2. USDA Foundation Foods for generic-food nutrition.
3. USDA SR Legacy and FNDDS for broader generic coverage.
4. Curated, cited evidence only for non-label categories such as GERD potential triggers.

## Provenance requirements

Every displayed record must retain dataset name, release date, FDC ID, and branded-label publication date when available.

## Release checks

- Run `npm run verify:data` after regenerating generic data.
- Run `npm run build:branded` after replacing Branded Foods.
- Manually review a representative barcode fixture set before publishing generated branded shards.
