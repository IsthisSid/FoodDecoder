# Contributing to Food Decoder

## Project principles

- Facts over opinions.
- Unknown is not safe.
- Dietary evidence must be deterministic, inspectable, and sourced.
- Do not add AI-generated dietary conclusions or medical-safety claims.

## Development workflow

1. Create a focused branch from `main`.
2. Keep changes scoped and add or update tests.
3. Run `npm run check` before opening a pull request.
4. Describe the data source, evidence state, and regression coverage for every evidence-rule change.

## Data changes

Raw USDA downloads remain under `data/raw/usda/` and are intentionally ignored by Git. Never commit the raw exports. Regenerate derived data with the documented scripts and include source release information in the change description.

## Evidence policy

- `Contains` requires a direct ingredient or allergen-label match.
- `May contain` requires explicit precautionary wording.
- `No listed ingredient` is not a safety guarantee.
- `Unknown` is required when source evidence is absent or unclear.
- `Potential trigger` requires a cited, non-diagnostic rule.
