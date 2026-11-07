# Ruled.me recipe archive

`recipes.json` combines all downloaded categories for app development. Image paths, featured images, and source HTML paths in this combined file are relative to this `data` directory. `scrape-report.json` summarizes category coverage and failures.

Each category (`breakfast`, `lunch`, `dinner`, `dessert`, `snacks`, `side-items`, `condiments`) has its own:

- `recipes.json`: complete category dataset, schema version 1.
- `recipes/*.json`: one JSON file per recipe URL slug.
- `images/`: the featured images used by the app. Preparation photos, unused image variants, and images from categories outside the app are in `../nenaudojama/` relative to this `data` directory. Archive JSON image paths point to their actual locations. Extensions match their actual file formats, including AVIF when served by the source.
- `pages/*.html`: original recipe pages preserving additional prose, ingredient groups, notes, and nutrition tables.
- `source-index.json`: the original site-wide discovery index.
- `scrape-report.json`: source timestamps, expected/saved counts, and download errors.

Paths inside category datasets are relative to that category's directory. Recipe text is in the original English. Each record includes source attribution, ingredients, instructions, servings, times, tags, nutrition, image source mappings, original Recipe JSON-LD (`rawRecipe`), and the source index record (`sourceIndex`). Missing data is not invented. The explicit net-carb value comes from the site's index and is stored separately from the original nutrition schema.

## Running

Requires Node 22+ and network access; no npm packages.

```sh
# Download the six additional categories, validate each, then rebuild the combined dataset.
node scripts/scrape-categories.mjs

# Select categories explicitly.
node scripts/scrape-categories.mjs breakfast lunch dinner dessert snacks side-items condiments

# Download or verify one category.
node scripts/scrape-recipes.mjs lunch
node scripts/verify-recipes.mjs lunch

# Rebuild and verify the combined file from existing archives without downloading.
node scripts/scrape-categories.mjs --catalog-only
```

The scraper uses three workers, retries requests, and resumes using existing HTML and images. The discovery index is fetched on each run. Remove a cached recipe page to fetch fresh HTML for that recipe. Failed recipe/image downloads produce a nonzero exit code and remain listed in the reports. The combined dataset is rebuilt by `scrape-categories.mjs`, including any existing category archives.

Validation checks expected recipe coverage, unique IDs, ingredients and instructions, individual/combined category JSON consistency, referenced files, and image file signatures.

Recipes and photographs retain their source attribution. App code and existing browser data are unchanged.

Unused-image inventory: `../nenaudojama/nuotraukos.json` lists every moved image, its original and current project-relative paths, recipe references, original URLs, byte size, and SHA-256. Category image paths may now begin with `../../nenaudojama/`; combined archive image paths may begin with `../nenaudojama/`. Resolve them relative to their respective JSON directories. The scraper reuses archived images using that inventory.
