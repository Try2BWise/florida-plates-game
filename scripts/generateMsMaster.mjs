import fs from "fs";

const plates = JSON.parse(fs.readFileSync("source_assets/mississippi/ms-plates-urls.json", "utf8"));

function categorize(name) {
  const n = name.toLowerCase();

  if (n.includes("veteran") || n.includes("medal of honor") || n.includes("bronze star") ||
      n.includes("silver star") || n.includes("purple heart") || n.includes("pearl harbor") ||
      n.includes("combat veteran") || n.includes("gold star") || n.includes("distinguished flying") ||
      n.includes("defense freedom") || n.includes("air medal") || n.includes("killed in action") ||
      n.includes("prisoner of war") || n.includes("marine corps") || n.includes("merchant marine") ||
      n.includes("navy and marine") || n.includes("national guard") || n.includes("active reserve") ||
      n.includes("female veteran") || n.includes("honoring veterans") || n.includes("veterans of foreign") ||
      n.includes("american legion") || n.includes("civil air patrol")) {
    if (n.includes("disabled") || n.includes("medal") || n.includes("bronze") || n.includes("silver star") ||
        n.includes("purple heart") || n.includes("pearl harbor") || n.includes("distinguished") ||
        n.includes("gold star") || n.includes("killed") || n.includes("prisoner") || n.includes("defense freedom") ||
        n.includes("air medal") || n.includes("combat")) return "Military Honors & History";
    return "Military Service";
  }

  if (n.includes("university") || n.includes("college") || n.includes("ole miss") ||
      n.includes("alcorn") || n.includes("jackson state") || n.includes("delta state") ||
      n.includes("belhaven") || n.includes("millsaps") || n.includes("tougaloo") ||
      n.includes("rust college") || n.includes("william carey") || n.includes("mississippi valley"))
    return "Universities";

  if (n.includes("school") || n.includes("attendance center") || n.includes("rockets") ||
      n.includes("home run club") || n.includes("athletic foundation"))
    return "Education & Culture";

  if (n.includes("alpha") || n.includes("delta sigma theta") || n.includes("omega psi") ||
      n.includes("kappa") || n.includes("phi beta sigma") || n.includes("zeta phi") ||
      n.includes("sigma gamma") || n.includes("eastern star") || n.includes("grand lodge"))
    return "Civic & Causes";

  if (n.includes("wildlife") || n.includes("bass - ") || n.includes("deer - ") || n.includes("butterfly - ") ||
      n.includes("hummingbird") || n.includes("turkey - ") || n.includes("mallard") || n.includes("rabbit - ") ||
      n.includes("speckled trout") || n.includes("lab - ") || n.includes("delta waterfowl") ||
      n.includes("ducks unlimited") || n.includes("wild turkey") || n.includes("kemp") ||
      n.includes("dolphin") || n.includes("shark") || n.includes("marine mammal") ||
      n.includes("coastal conservation") || n.includes("forestry") || n.includes("soil conservation") ||
      n.includes("state parks") || n.includes("i care for animals") || n.includes("cattleman"))
    return "Nature & Wildlife";

  if (n.includes("cancer") || n.includes("autism") || n.includes("alzheimer") || n.includes("diabeti") ||
      n.includes("down syndrome") || n.includes("dyslexia") || n.includes("hearing impaired") ||
      n.includes("blood services") || n.includes("organ donor") || n.includes("children's hospital") ||
      n.includes("le bonheur") || n.includes("st jude") || n.includes("juvenile diabetes") ||
      n.includes("toughest kids") || n.includes("choose life") || n.includes("catch a dream") ||
      n.includes("children's museum") || n.includes("children's advocacy") || n.includes("after school"))
    return "Health & Family";

  if (n.includes("law enforcement") || n.includes("fire fighter") || n.includes("firefighter") ||
      n.includes("sheriff") || n.includes("trooper") || n.includes("fallen officer") ||
      n.includes("police") || n.includes("emergency services") || n.includes("wildlife enforcement"))
    return "Public Service";

  if (n.includes("governor") || n.includes("senator") || n.includes("representative") ||
      n.includes("government") || n.includes("state flag"))
    return "Government & Official";

  if (n.includes("saints") || n.includes("nascar") || n.includes("championship") ||
      n.includes("mixed martial") || n.includes("golf association") || n.includes("tennis association") ||
      n.includes("soccer") || n.includes("equine"))
    return "Sports & Recreation";

  if (n.includes("antique") || n.includes("street rod") || n.includes("historical") ||
      n.includes("historic natchez"))
    return "Historical & Antique";

  if (n.includes("motorcycle") && !n.includes("antique"))
    return "Motorcycle Plates";

  if (n.includes("dealer") || n.includes("fleet") || n.includes("hearse") || n.includes("taxi") ||
      n.includes("church bus") || n.includes("school bus") || n.includes("apportioned") ||
      n.includes("heavy truck") || n.includes("trailer") || n.includes("demo") || n.includes("ev mississippi") ||
      n.includes("blackout") || n.includes("vanity") || n.includes("board of contractor") ||
      n.includes("harvest") || n.includes("temporary") || n.includes("amateur radio"))
    return "Special Use";

  if (n.includes("f16") || n.includes("b16") || n.includes("f-10") || n.includes("b-10"))
    return "Standard Plates";

  if (n.includes("tourism") || n.includes("home of the blues") || n.includes("i love mississippi") ||
      n.includes("elvis") || n.includes("aquarium") || n.includes("jackson zoo") ||
      n.includes("public broadcasting") || n.includes("dixie national"))
    return "Travel & Tourism";

  if (n.includes("disabled"))
    return "Accessibility";

  return "Civic & Causes";
}

const masterPlates = plates.map(p => {
  const cat = categorize(p.name);
  const isMoto = p.name.toLowerCase().includes("motorcycle");

  return {
    id: "ms-" + p.slug,
    slug: p.slug,
    name: p.name,
    displayName: p.name,
    baseName: isMoto ? p.name.replace(/ ?-? ?Motorcycle/i, "").trim() : p.name,
    variantLabel: isMoto ? "Motorcycle" : null,
    plateType: isMoto ? "motorcycle" : "passenger",
    isCurrent: true,
    isActive: true,
    category: cat,
    image: {
      path: "state-packs/mississippi/plates/" + p.slug + ".webp",
      remoteUrl: p.src
    },
    sponsor: null,
    notes: null,
    searchTerms: [],
    variantOf: isMoto ? "ms-" + p.slug.replace(/-motorcycle$/, "") : null,
    relatedPlates: [],
    metadataBlob: null,
    sourceRefs: [{ source: "Mississippi DOR", sourceId: p.slug, versionId: null, value: null }]
  };
});

const master = {
  schemaVersion: 1,
  state: "Mississippi",
  generatedDate: new Date().toISOString().split("T")[0],
  description: "Mississippi specialty license plates from DOR website",
  sourceFiles: ["https://www.dor.ms.gov/motor-vehicle/available-license-plates/specialty-license-plates"],
  plates: masterPlates
};

fs.writeFileSync("src/data/mississippi-plate-master.json", JSON.stringify(master, null, 2));
console.log("Generated master with " + masterPlates.length + " plates");

const cats = {};
masterPlates.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log("  " + n + " " + c));
