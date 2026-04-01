$plates = Get-Content analysis\mississippi\official-specialty-plates-with-images-2026-03-31.json | ConvertFrom-Json
function Slugify([string]$value) {
  $s = $value.ToLowerInvariant()
  $s = $s.Replace('’','').Replace("'",'').Replace('`','')
  $s = $s -replace '&', ' and '
  $s = $s -replace '[^a-z0-9]+', '-'
  $s = $s.Trim('-')
  return $s
}
$categoryOverrides = @{
  '2022 National Championship Ole Miss Baseball' = 'Universities'
  'American Legion' = 'Military Service'
  'Band of Choctaw Indians' = 'Standard Plates'
  'Catch A Dream Foundation' = 'Health & Family'
  'Children’s Advocacy Center' = 'Health & Family'
  'Defense Freedom Medal' = 'Military Honors & History'
  'Delta Waterfowl' = 'Nature & Wildlife'
  'Dental Hygienist' = 'Health & Family'
  'Ducks Unlimited Inc' = 'Nature & Wildlife'
  'Friends of Children’s Hospital' = 'Health & Family'
  'Harvest Permitees' = 'Special Use'
  'Le Bonheur Children’s Hospital' = 'Health & Family'
  'Medal of Honor - Army' = 'Military Honors & History'
  'Medal of Honor - Marine' = 'Military Honors & History'
  'Mississippi Association of Emergency Services' = 'Public Service'
  'Mississippi Children''s Museum' = 'Education & Culture'
  'Mississippi Family Physicians' = 'Health & Family'
  'Mississippi Nurses Foundation' = 'Health & Family'
  'Mississippi Public Broadcasting' = 'Education & Culture'
  'Oak Grove School' = 'Public Schools'
  'Passenger' = 'Standard Plates'
  'School Bus' = 'Special Use'
  'Mixed Martial Arts' = 'Sports & Recreation'
  'MS Sweet Potato' = 'Civic & Causes'
  'National Rifle Association' = 'Sports & Recreation'
  'National Rifle Association - Trailer' = 'Civic & Causes'
  'Madison Jaguars' = 'Public Schools'
  'Neshoba Central Rockets' = 'Public Schools'
  'Ole Miss Welcome Home' = 'Universities'
  'Pearl River Valley Water' = 'Civic & Causes'
  'Profession of Pharmacy' = 'Health & Family'
  'Professional Hair Designers' = 'Civic & Causes'
  'Silver Star' = 'Military Honors & History'
  'Soil Conservation' = 'Nature & Wildlife'
  'St Jude Children’s Hospital' = 'Health & Family'
  'Support Teachers' = 'Education & Culture'
  'Tupelo Elvis Presley Fan Club' = 'Travel & Tourism'
  'Volunteer Service' = 'Civic & Causes'
  'Starkville – Oktibbeha Football' = 'Public Schools'
  'West Lauderdale Knights' = 'Public Schools'
  'Bronze Star' = 'Military Honors & History'
  'Bronze Star Disabled' = 'Military Honors & History'
  'Distinguished Flying Cross' = 'Military Honors & History'
  'Purple Heart - Disabled' = 'Military Honors & History'
  'Purple Heart - Original' = 'Military Honors & History'
  'Purple Heart - Motorcycle' = 'Motorcycle Plates'
  'Pearl Harbor' = 'Military Honors & History'
  'Pearl Harbor - Motorcycle' = 'Motorcycle Plates'
  'Killed in Action' = 'Military Honors & History'
  'Ex Prisoner of War' = 'Military Honors & History'
  'Honoring Veterans' = 'Military Service'
  'Honoring Fallen Officers' = 'Public Service'
  'Civil Air Patrol' = 'Military Service'
  'Wildlife Enforcement' = 'Public Service'
  'Fire Fighters' = 'Public Service'
  'Professional Fire Fighter' = 'Public Service'
  'State Flag' = 'Standard Plates'
  'Board of Contractor' = 'Government & Official'
  'B10 Blackout' = 'Standard Plates'
  'B16-B80' = 'Standard Plates'
  'F10 Blackout' = 'Standard Plates'
  'F16-F80' = 'Standard Plates'
  'Blackout Pickup' = 'Standard Plates'
}
function Get-Category([string]$name) {
  if($categoryOverrides.ContainsKey($name)) { return $categoryOverrides[$name] }
  $n = $name.ToLowerInvariant()
  if($n -match 'motorcycle'){ return 'Motorcycle Plates' }
  if($n -match 'gold star|purple heart|bronze star|silver star|air medal|distinguished flying cross|medal of honor|pearl harbor|killed in action|prisoner of war'){ return 'Military Honors & History' }
  if($n -match 'veteran|afghanistan|iraq|combat|active reserve|national guard|marine corps|merchant marine|vietnam|honoring veterans|veterans of foreign wars|american legion'){ return 'Military Service' }
  if($n -match 'wildlife|bass|deer|turkey|trout|rabbit|butterfly|hummingbird|sea turtle|dolphin|shark|animal|zoo|aquarium|waterfowl|ducks unlimited|soil conservation'){ return 'Nature & Wildlife' }
  if($n -match 'university|college$|community college|state university|ole miss'){ return 'Universities' }
  if($n -match 'school district|public school|attendance center|high school'){ return 'Public Schools' }
  if($n -match 'school bus'){ return 'Special Use' }
  if($n -match 'school|support teachers|museum|public broadcasting'){ return 'Education & Culture' }
  if($n -match 'saints football'){ return 'Professional Sports' }
  if($n -match 'football|baseball championship|soccer association|athletic foundation|tennis|golf|home run club|jaguars|mixed martial arts'){ return 'Sports & Recreation' }
  if($n -match 'law enforcement|sheriff|fire fighter|fallen officers|police athletic league|wildlife enforcement|troopers|emergency services|civil air patrol'){ return 'Public Service' }
  if($n -match 'disabled|hearing impaired'){ return 'Accessibility' }
  if($n -match 'alzheimer|autism|cancer|children.?s hospital|juvenile diabetes|diabetic|blood services|organ donor|dyslexia|family physicians|nurses|advocacy center|pharmacy|hygienist'){ return 'Health & Family' }
  if($n -match 'government|governor|house of representative|senator|board of contractor'){ return 'Government & Official' }
  if($n -match 'taxi|truck|trailer|dealer|fleet|hearse|church bus|school bus|temporary|harvest permittees|street rod|historical|antique|passenger|vanity'){ return 'Special Use' }
  if($n -match 'tourism|natchez|blues|state parks|elvis'){ return 'Travel & Tourism' }
  if($n -match 'band of choctaw indians|state flag|blackout|b16-b80|f16-f80'){ return 'Standard Plates' }
  return 'Civic & Causes'
}
$draft = [ordered]@{
  schemaVersion = 1
  state = 'Mississippi'
  generatedDate = '2026-03-31'
  description = 'Second-pass Mississippi master draft generated from official specialty plate page. Categories improved, but human review is still required.'
  sourceFiles = @('https://www.dor.ms.gov/motor-vehicle/available-license-plates/specialty-license-plates')
  plates = @()
}
foreach($plate in $plates){
  $displayName = $plate.name.Trim()
  $isMotorcycleVariant = $displayName -match ' - Motorcycle$| Motorcycle$'
  $baseName = $displayName -replace ' - Motorcycle$','' -replace ' Motorcycle$',''
  $slug = Slugify($displayName)
  $variantLabel = if($isMotorcycleVariant){ 'Motorcycle' } else { $null }
  $variantOf = if($isMotorcycleVariant){ Slugify($baseName) } else { $null }
  $name = $baseName
  $searchTerms = @($displayName.ToLowerInvariant(), $baseName.ToLowerInvariant()) | Select-Object -Unique
  $draft.plates += [ordered]@{
    id = $slug
    slug = $slug
    name = $name
    displayName = $displayName
    baseName = $baseName
    variantLabel = $variantLabel
    plateType = 'license_plate'
    isCurrent = $true
    isActive = $true
    category = Get-Category $displayName
    image = [ordered]@{
      path = ('plates/' + ($slug -replace '-','_') + '.webp')
      remoteUrl = $plate.remoteUrl
    }
    sponsor = $null
    notes = 'Second-pass official Mississippi scrape. Review category, search terms, and variant relationships.'
    searchTerms = $searchTerms
    variantOf = $variantOf
    relatedPlates = @()
    metadataBlob = [ordered]@{
      sourceCategories = @()
      aliases = @()
      rawNames = @($displayName)
      filenames = @()
      urls = @($plate.remoteUrl)
    }
    sourceRefs = @(
      [ordered]@{
        source = 'official-specialty-license-plates-page'
        sourceId = $displayName
      }
    )
  }
}
$draft | ConvertTo-Json -Depth 8 | Set-Content analysis\mississippi\mississippi-master-draft-pass2-2026-03-31.json
$draft.plates | Group-Object category | Sort-Object Count -Descending | Select-Object Count,Name | ConvertTo-Json | Set-Content analysis\mississippi\mississippi-master-draft-pass2-category-summary-2026-03-31.json





