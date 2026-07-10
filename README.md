# Food Decoder

Food Decoder is a deterministic, no-AI food lookup app. It answers one practical question: what nutrition and dietary evidence is available for this food?

Version 1 searches a locally generated USDA FoodData Central index. It makes no live food-data API calls during a search.

## What V1 supports

- Local name search across USDA Foundation Foods, SR Legacy, and FNDDS
- Nutrition facts standardized to 100 g
- Source name and release date shown with every result
- Conservative dietary status: when a USDA generic record has no ingredient or allergen declaration, the app shows `Unknown` rather than marking the food safe

Barcode lookup and packaged-food ingredient/allergen verification are intentionally not available yet. They require a separate, verified packaged-food dataset.

## Data sources

| Dataset | Release used | Purpose |
| --- | --- | --- |
| USDA Foundation Foods | 2026-04-30 | Current analytical data for minimally processed foods |
| USDA SR Legacy | 2018-04-01 | Broad generic food coverage |
| USDA FNDDS 2021–2023 | 2024-10-31 | Prepared foods and reference portions |

The raw USDA files belong in `data/raw/usda/` and are deliberately ignored by Git. The application uses the generated `public/data/usda-food-index.json` file.

## Local development

```bash
npm install
npm run build:data
npm run dev
```

## Data workflow

After replacing a raw USDA export, regenerate and verify the local index:

```bash
npm run build:data
npm run verify:data
```

`verify:data` validates every generated record against the raw source datasets, including the food name, release date, and normalized nutrition values.

## Quality checks

```bash
npm run build
npm run lint
npx vitest run
```

## Product principles

- Facts over opinions
- Deterministic rules only; no AI
- Unknown is not safe
- Source provenance is displayed, not hidden
