# Prompt: Scrape Standard Plate Images from Official DMV Sites

**Goal**: Visit each US state's official motor vehicle agency website, find the current standard-issue license plate image, and download it. Produce a mapping report with source URLs and any issues.

---

## Jurisdictions Needed (57 total)

### 50 States
Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming

### DC + Territories + Federal
District of Columbia, Puerto Rico, U.S. Virgin Islands, Guam, American Samoa, Northern Mariana Islands, U.S. Government

---

## How to Find Each Image

For each jurisdiction:

1. Go to the official DMV / DOR / motor vehicle division website.
2. Navigate to the specialty plates or plate catalog page.
3. Find the **standard issue / base plate** — the default plate every registered vehicle gets. It is often labeled "standard", "base", "default", or simply shown first.
4. Download or capture the plate image.

### Common Agency Names by State

These vary widely. Some examples to help you find the right site:
- **DMV** (Department of Motor Vehicles) — CA, CT, DC, NV, NY, VA, WV
- **DOR** (Department of Revenue) — GA, MS, TN
- **BMV** (Bureau of Motor Vehicles) — IN, OH
- **MVD** (Motor Vehicle Division) — AZ, NM
- **RMV** (Registry of Motor Vehicles) — MA
- **Secretary of State** — IL, MI, MN
- **Tax Commission** — AL, OK

When in doubt, search: `[State] official license plate catalog site:.gov`

### Territories
- **Puerto Rico**: DTOP (Departamento de Transportacion y Obras Publicas)
- **U.S. Virgin Islands**: BMV
- **Guam**: DRT (Department of Revenue and Taxation)
- **American Samoa**: DPS (Department of Public Safety)
- **Northern Mariana Islands**: DPS

### U.S. Government
Search for "U.S. Government official vehicle license plate" — these are the white plates with blue "U.S. Government" text and an agency code. Wikimedia Commons or GSA.gov may be the best source for this one.

---

## What to Download

For each jurisdiction, get the **one image** that best represents the current standard-issue plate:
- Prefer clean product shots, catalog images, or flat renders
- Avoid photos taken at angles on vehicles
- Avoid plates with custom/vanity text that obscures the design
- If a state has recently redesigned their plate and both are in circulation, prefer the **newer** design
- If a state offers multiple standard base options (e.g., New York's blue/gold vs. "Excelsior"), choose the **default that ships with new registrations**

---

## Output

### 1. Downloaded Images

Save all images to a single folder. Name each file:

```
a250-[kebab-case-name].[ext]
```

Full name list:
```
a250-alabama        a250-montana           a250-district-of-columbia
a250-alaska          a250-nebraska          a250-puerto-rico
a250-arizona         a250-nevada            a250-us-virgin-islands
a250-arkansas        a250-new-hampshire     a250-guam
a250-california      a250-new-jersey        a250-american-samoa
a250-colorado        a250-new-mexico        a250-northern-mariana-islands
a250-connecticut     a250-new-york          a250-us-government
a250-delaware        a250-north-carolina
a250-florida         a250-north-dakota
a250-georgia         a250-ohio
a250-hawaii          a250-oklahoma
a250-idaho           a250-oregon
a250-illinois        a250-pennsylvania
a250-indiana         a250-rhode-island
a250-iowa            a250-south-carolina
a250-kansas          a250-south-dakota
a250-kentucky        a250-tennessee
a250-louisiana       a250-texas
a250-maine           a250-utah
a250-maryland        a250-vermont
a250-massachusetts   a250-virginia
a250-michigan        a250-washington
a250-minnesota       a250-west-virginia
a250-mississippi     a250-wisconsin
a250-missouri        a250-wyoming
```

Keep the original file extension (jpg, png, webp, svg). I'll normalize later.

### 2. Mapping Report

Produce `fifty-states-image-report.md` with this table:

| Jurisdiction | Filename | Source URL | Notes |
|---|---|---|---|
| Alabama | a250-alabama.jpg | https://revenue.alabama.gov/... | "Sweet Home Alabama" base plate |
| Alaska | a250-alaska.png | https://doa.alaska.gov/... | Gold rush / "The Last Frontier" design |

### 3. Issues Section

At the bottom of the report, flag:
- **No image found**: Jurisdiction and what you tried
- **Low quality**: Jurisdiction, resolution, whether a better source exists elsewhere
- **Ambiguous default**: States where you had to choose between multiple "standard" plates — explain which you picked and why
- **Non-.gov source used**: If you had to fall back to a non-official source, note which and why

---

## Work in Batches

Process **10 states at a time** (alphabetical) so I can review early batches and catch issues before you continue. After each batch, pause and show me:
1. The batch of images downloaded
2. The mapping table rows for that batch
3. Any issues from that batch

---

## What NOT to Do

- Don't modify, crop, or resize images
- Don't fabricate placeholder images
- Don't use collector sites, aggregation sites, or eBay listings as image sources
- Don't download specialty/vanity plates — only the standard base plate
- Don't guess at URLs — actually visit the page and confirm the image exists
