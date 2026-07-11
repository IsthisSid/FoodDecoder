# Architecture

Food Decoder is a static React application. It performs no live food-data API calls during lookup.

## Lookup paths

- **Food name:** `public/data/usda-food-index.json`, generated from Foundation Foods, SR Legacy, and FNDDS.
- **Barcode:** one deterministic hash shard in `public/data/branded/`, generated from USDA Branded Foods.

## Evidence pipeline

1. A local product record provides a source, date, and—when available—an ingredient statement.
2. Deterministic rules classify only explicit evidence.
3. The UI filters evidence by the user’s selected dietary concerns.
4. The UI presents the matched text, evidence state, and source.

The rules engine never returns a universal safety guarantee.
