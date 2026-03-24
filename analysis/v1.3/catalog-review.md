# v1.3 Catalog Review

## Summary

- Logical plates in merged catalog: 175
- Plates with both legacy and current versions: 50
- Legacy-only plates: 16
- Current-only plates: 55
- Normalized-name matches: 68
- Manual override matches: 36
- ZIP source rows after cleanup: 160
- Charity metadata rows: 150

## App Categories

- Universities: 46
- Professional Sports: 10
- Nature & Wildlife: 34
- Military & Veterans: 20
- Public Safety: 7
- Health & Family: 17
- Civic & Causes: 21
- Education & Culture: 8
- Recreation & Tourism: 12

## Multi-Version Samples

- Animal Friend
- Barry University
- Blue Angels (aliases: Blue Angels Florida MOTORCYCLE)
- Conserve Wildlife
- Eckerd College
- Edward Waters College
- Family Values
- Flagler College
- Florida Atlantic University (aliases: Florida Atlantic University FAU)
- Florida College
- Florida Gulf Coast University (aliases: Florida Gulf Coast)
- Florida Hospital College of Health Sciences
- Florida Institute of Technology
- Florida International University (aliases: FIU)
- Florida Memorial University
- Florida Panthers (Hockey) (aliases: Florida Panthers)
- Florida Southern College
- Florida Special Olympic (aliases: Support Florida Special Olympics)
- Florida State University (aliases: FSU)
- Helping Sea Turtles (aliases: Sea Turtle, Helping Sea Turtles Survive)
- Indian River Lagoon
- Jacksonville University
- Lynn University
- Miami Dolphins (Football) (aliases: Miami Dolphins)
- Miami Heat (Basketball) (aliases: Miami Heat)

## Current-Only Samples

- AdventHealth University -> possible legacy matches: Barry University (0.50), Florida A & M University (0.50), Florida Atlantic University (0.50)
- Air Force Combat Action Medal
- Air Force Cross
- America The Beautiful
- American Legion
- Army of Occupation
- Auburn University
- Ave Maria University
- Beacon College
- Best Buddies Tom Brady
- Big Brothers Big Sisters
- Blue Angels
- Bonefish and Tarpon Trust
- Bronze Star
- Combat Action Badge
- Combat Action Ribbon
- Combat Infantry Badge
- Combat Medical Badge
- Conserve Florida Fisheries
- Distinguished Flying Cross
- Distinguished Service Cross
- Divine Nines: Alpha Kappa Alpha Sorority
- Divine Nines: Alpha Phi Alpha Sorority
- Divine Nines: Delta Sigma Theta Sorority
- Divine Nines: Iota Phi Theta Fraternity
- Divine Nines: Kappa Alpha Psi Fraternity
- Divine Nines: Omega Psi Phi Fraternity
- Divine Nines: Phi Beta Sigma Fraternity
- Divine Nines: Sigma Gamma Rho Sorority
- Divine Nines: Zeta Phi Beta Sorority

## Legacy-Only Samples

- A State of Vision
- American Red Cross
- Catch Me Release Me
- Clearwater Christian College
- Donate Organs
- Florida Sheriff's Youth Ranch
- Hispanic Achievers
- Keep Kids Drug Free
- Large Mouth Bass
- Motocycle Specialty
- Panther
- Parents Make A Difference
- Police Benevolent Association
- Sportsmen's National Land Trust
- St. Johns River
- Support Soccer

## Notes

- Current in-app plates are treated as legacy versions.
- ZIP plates are treated as current versions.
- ZIP duplicates caused only by URL host differences were collapsed.
- The charity file is used as enrichment only because category and confidence data need normalization.
