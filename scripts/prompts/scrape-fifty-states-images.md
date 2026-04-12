# Prompt: Scrape Standard Plate Images from Wikipedia

**Goal**: Download the current standard-issue license plate image for every US state, DC, and territory from Wikipedia/Wikimedia Commons, then produce a mapping file I can use to rename them.

---

## Jurisdictions Needed (57 total)

### 50 States
Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming

### DC + Territories + Federal
District of Columbia, Puerto Rico, U.S. Virgin Islands, Guam, American Samoa, Northern Mariana Islands, U.S. Government

---

## Where to Find Images

1. Start at the Wikipedia article **"Vehicle registration plates of the United States"** — it has a table with thumbnail images for every state's current plate.
2. For each jurisdiction, click through to the **Wikimedia Commons file page** to get the full-resolution image URL.
3. If a state has multiple current designs (e.g., a "base" plate and a redesigned plate rolling out), prefer the **most widely issued** design — usually the one shown first on Wikipedia.
4. For territories, check the individual Wikipedia articles: "Vehicle registration plates of Puerto Rico", "Vehicle registration plates of Guam", etc.
5. For U.S. Government plates, search Wikimedia Commons for "United States government license plate".

---

## What to Download

For each jurisdiction, download the **best available image** of the current standard-issue plate. Prefer:
- Clean, flat photos or scans (not angled photos on cars)
- Images showing the full plate design without custom text obscuring the artwork
- Higher resolution when available (but don't go above ~1000px wide)

---

## Output

### 1. Downloaded Images

Save all images to a single folder. Name each file using this convention:

```
a250-[kebab-case-name].[ext]
```

Examples:
- `a250-alabama.jpg`
- `a250-new-york.png`
- `a250-district-of-columbia.jpg`
- `a250-puerto-rico.jpg`
- `a250-us-government.jpg`

Use whatever extension the source file has (jpg, png, svg). I'll normalize formats later.

### 2. Mapping Report

Produce a `fifty-states-image-report.md` with a table:

| Jurisdiction | Filename | Source URL | Wikimedia License | Notes |
|---|---|---|---|---|
| Alabama | a250-alabama.jpg | https://commons.wikimedia.org/... | CC BY-SA 4.0 | Current "Sweet Home Alabama" base |
| Alaska | a250-alaska.png | ... | ... | ... |

Include a **Notes** column for anything I should know:
- "Multiple current designs — chose the most common base plate"
- "Only low-res image available"
- "Image is of an older design — couldn't find current"
- "No image found" (for any jurisdiction where you struck out)

### 3. Missing/Problem List

At the bottom of the report, list any jurisdictions where:
- No image was found at all
- Only a very low-quality image exists
- The image might be an outdated design
- License terms are unclear

---

## Licensing Notes

Wikimedia Commons images are typically CC BY-SA or public domain. License plate images in the US are generally considered **utilitarian works not eligible for copyright** (the designs are government-issued), but I still want the license info tracked for transparency.

---

## What NOT to Do

- Don't modify, crop, or resize the images — I'll handle post-processing
- Don't fabricate placeholder images
- Don't include multiple images per jurisdiction — just the best single image
- Don't scrape from non-Wikimedia sources without noting it
