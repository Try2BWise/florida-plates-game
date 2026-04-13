# State Research Tracker

Per-state notes for the path to 50. Captures DMV/DOR catalog URL, scrape difficulty tier, image URL pattern (when known), official region source, and any state-specific quirks.

## Tier definitions

| Tier | Description | Approach |
|------|-------------|----------|
| **1** | Clean static HTML catalog or REST API | Python script via WP REST API or BeautifulSoup |
| **2** | Single index page with thumbnails, no detail pages | Scrape the index directly |
| **3** | Sponsor-link maze on DMV site | Hand-curate from official portal, supplement manually |
| **4** | Locked down (Cloudflare/vendor) or JS-only dynamic forms | Manual standard plate only, full catalog deferred |

---

## Live States (12)

| State | Plates | Source | Tier | Region Source |
|-------|--------|--------|------|---------------|
| Florida | 338 | FL DHSMV | 1 | DHSMV regions |
| Mississippi | 305 | MS DOR | 1 | Mississippi Development Authority |
| Georgia | 287 | mvd.dor.ga.gov (PlateSelection.aspx) | 1 | GA Regional Commissions (12 → 5 game) |
| Kentucky | 230 | KY DOR | 1 | University of Kentucky geographic regions |
| Tennessee | 210 | TN DOR | 1 | Grand Divisions (legal) |
| Missouri | 162 | MO DOR | 1 | Missouri Division of Tourism (visitmo.com) |
| Arizona | 132 | AZ MVD | 1 | TBD |
| Arkansas | 129 | dfa.arkansas.gov | 1 | Arkansas Tourism (arkansas.com) |
| Alabama | 99 | revenue.alabama.gov (WP REST API) | 1 | AL Regional Councils (12 → 5 game) |
| California | 94 | DMV | 1 | TBD |
| Kansas | 85 | ksrevenue.gov (dovpersplate.html) | 2 | KDWP 5 regions |
| Alaska | 47 | DMV | 1 | TBD |

---

## Remaining 38 States — Research Pending

Sorted alphabetically. Fill in as scouted.

### Phase A target: standard plate only, then move on.
### Phase B target: full catalog when scrape difficulty is understood.

| State | Standard plate URL | Catalog URL | Tier | Image pattern | Region source | Notes |
|-------|---------------------|-------------|------|----------------|---------------|-------|
| Colorado | | | | | | |
| Connecticut | | | | | | |
| Delaware | | | | | | |
| Hawaii | | | | | | |
| Idaho | | | | | | |
| Illinois | | | | | | |
| Indiana | | | | | | Worth retrying with WP REST API trick |
| Iowa | | | | | | |
| Louisiana | | | | | | omv.la.gov, dynamic plate viewer |
| Maine | | | | | | |
| Maryland | | | | | | |
| Massachusetts | | | | | | |
| Michigan | | | | | | |
| Minnesota | | | | | | |
| Montana | | | | | | |
| Nebraska | | | | | | |
| Nevada | | | | | | |
| New Hampshire | | | | | | |
| New Jersey | | | | | | |
| New Mexico | | | | | | |
| New York | | | | 4 | | DMV plates listed as PDFs |
| North Carolina | | | | | | Earlier attempt: 1 hour wasted. Retry with WP REST API check |
| North Dakota | | | | | | |
| Ohio | bmv.ohio.gov | bmvonline.dps.ohio.gov | 4 | dynamic | | JavaScript form, server-side rendering. Standard plate manually only |
| Oklahoma | | | | | | |
| Oregon | | | | | | |
| Pennsylvania | | | | | | |
| Rhode Island | | | | | | |
| South Carolina | dmv.sc.gov | | | | | scdmvonline.com 404s on specialty page |
| South Dakota | | | | | | |
| Texas | txdmv.gov → myplates.com | locked | 4 | | | Cloudflare protected. Standard plate manually only |
| Utah | | | | | | |
| Vermont | | | | | | |
| Virginia | | | | | | |
| Washington | | | | | | |
| West Virginia | | | | | | |
| Wisconsin | | | | | | |
| Wyoming | | | | | | |

---

## Recon recipe

For each state, in order:

1. **Try WP REST API first** — many state DMVs run WordPress with a `license-plates` custom post type:
   ```
   https://{dmv-domain}/wp-json/wp/v2/license-plates?per_page=5&page=1&_embed
   ```
   Look at headers `X-WP-Total` and `X-WP-TotalPages`. If 200, you have a Tier 1 winner — Alabama-style scrape via REST.

2. **Check the DMV specialty plates index page** in a browser. If you see thumbnails and the page source has `<img src="...">` with predictable URLs, it's Tier 1 HTML.

3. **Check for a single-page listing** with all plates as images on one page (Kansas-style). That's Tier 2 — no per-plate detail page needed.

4. **If thumbnails link to sponsor sites with no direct images on the DMV page**, it's Tier 3.

5. **If the page is JS-only (Elementor dynamic forms, MyPlates vendor)**, it's Tier 4 — Phase B is manual or deferred.

## Region source recipe

For each state, look (in order):

1. State tourism website official regions (often 4-8 regions)
2. State Wildlife & Parks / Fish & Game regions
3. Regional planning commissions / councils of government (often 8-16 districts that consolidate to 5-6 game regions)
4. Geographic regions per Wikipedia Geography of {State}

Verify all counties covered, no overlaps, before adding to game config. Kansas was a hard lesson — invented regions had 3 missing counties.
