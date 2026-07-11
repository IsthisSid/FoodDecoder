# Food Decoder

Food Decoder is a deterministic, no-AI food evidence tool. It reports local USDA nutrition and product-label evidence so people can make their own dietary decisions.

> Food facts. Your decision.

## V1.0.0 capabilities

- Local generic-food name search across USDA Foundation Foods, SR Legacy, and FNDDS
- Exact local barcode lookup across USDA Branded Foods
- Nutrition values standardized to 100 g
- Ingredient-label evidence for milk, egg, peanut, tree nuts, sesame, soy, gluten ingredients, fish, shellfish, lactose-related milk ingredients, and selected GERD potential-trigger ingredients
- Conservative evidence states: `Contains`, `May contain`, `No listed ingredient`, `Potential trigger`, and `Unknown`
- Source provenance shown for every result: dataset release, FDC ID, and branded-label date when available
- No live food-data API calls during lookup

Food Decoder does not verify cross-contact, guarantee that a food is safe, or replace medical guidance.

## Data sources

| Dataset | Release used | Purpose |
| --- | --- | --- |
| USDA Foundation Foods | 2026-04-30 | Analytical generic-food nutrition |
| USDA SR Legacy | 2018-04-01 | Broad generic-food coverage |
| USDA FNDDS 2021–2023 | 2024-10-31 | Prepared foods and portions |
| USDA Branded Foods | 2026-04-30 | Barcode, product-label ingredient, serving, and brand evidence |
| NIDDK GERD dietary guidance | Reviewed 2026-07-10 | Cited potential-trigger categories only |

Raw USDA downloads belong in `data/raw/usda/` and are ignored by Git. The app uses generated static indexes:

- `public/data/usda-food-index.json` for generic food search
- `public/data/branded/*.json` for hash-sharded barcode lookup

## Local development

```bash
npm install
npm run build:data
npm run build:branded
npm run verify:branded
npm run dev
```

## Data workflow

```bash
npm run build:data
npm run verify:data
npm run build:branded
```

`build:branded` streams the 3.3 GB raw Branded Foods JSON without loading it all into memory. It keeps barcode records with ingredient statements, selects the newest publication per barcode, and writes 256 static lookup shards.

`verify:branded` validates every generated barcode shard for record counts, source release, barcode uniqueness, hash placement, and required ingredient evidence.

## Quality checks

```bash
npm run build
npm run lint
npx vitest run
```

For contributors, `npm run check` runs linting, unit and snapshot tests, and the production build in one command. See [CONTRIBUTING.md](CONTRIBUTING.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/DATA_GOVERNANCE.md](docs/DATA_GOVERNANCE.md).

## GitHub Pages

Pushing `main` runs the included GitHub Actions workflow. Enable **Settings → Pages → Build and deployment → GitHub Actions** in the repository to publish the static site.

## Product principles

- Facts over opinions
- Deterministic rules only; no AI
- Unknown is not safe
- Evidence includes its source
- The user makes the final decision
