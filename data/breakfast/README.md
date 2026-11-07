# Ruled.me breakfast archive

Run from the repository root: `node scripts/scrape-breakfast.mjs` (Node 22+, no dependencies).

- `recipes.json`: complete collection, with readable field names and schema version.
- `recipes/*.json`: the same records individually, named by source URL slug.
- `images/`: app cover images. Unused image variants and preparation photographs were moved to `../../nenaudojama/breakfast/images/`. Every `images[].path` remains relative to this breakfast directory and now points to the actual file location.
- `pages/*.html`: original recipe pages, preserving prose, tables, ingredient groups, and other details beyond the normalized fields.
- `source-index.json`: original site-wide discovery index, retained for provenance. Only breakfast recipes are downloaded.
- `scrape-report.json`: expected and saved counts, download errors, and source timestamps.

Each recipe retains its source URL, original Recipe JSON-LD in `rawRecipe`, the source index entry, ingredients, instructions, servings, timing, dietary tags, nutrition, and image mappings. Recipe text remains in English. `nutritionPerServing.netCarbsGrams` comes from the site's explicit net-carb field; the source JSON-LD carbohydrate field is preserved without reinterpretation. Missing values remain missing or null.

The scraper uses three workers, retries failed requests, and reuses existing pages and photos. Delete a cached page to refresh that recipe's source. The discovery index is fetched again on each run. Check the report before importing; a run with failed recipes or images exits with a nonzero status.

Recipe text and images belong to their respective owners; source attribution is retained. This archive does not change the app or browser-stored user data.
