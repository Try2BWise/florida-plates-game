$plates = Get-Content analysis\mississippi\official-specialty-plates-with-images-2026-03-31.json | ConvertFrom-Json
function Slugify([string]$value) {
  $s = $value.ToLowerInvariant()
  $s = $s.Replace('’','').Replace("'",'').Replace('`','')
  $s = $s -replace '&', ' and '
  $s = $s -replace '[^a-z0-9]+', '-'
  $s = $s.Trim('-')
  return $s
}
function Get-Category([string]$name) {
  $n = $name.ToLowerInvariant()
  if($n -match 'motorcycle'){ return 'Motorcycle Plates' }
  if($n -match 'veteran|gold star|purple heart|bronze star|silver star|air medal|distinguished flying cross|medal of honor|afghanistan|iraq|pow|prisoner of war|combat|killed in action|active reserve|national guard|marine corps|pearl harbor|merchant marine|vietnam'){ return 'Military Service' }
  if($n -match 'wildlife|bass|deer|turkey|trout|rabbit|butterfly|hummingbird|sea turtle|dolphin|shark|animal|zoo|aquarium'){ return 'Nature & Wildlife' }
  if($n -match 'university|college$|community college|state university'){ return 'Universities' }
  if($n -match 'school|school district|attendance center'){ return 'Education & Culture' }
  if($n -match 'saints football'){ return 'Professional Sports' }
  if($n -match 'football|baseball championship|soccer association|athletic foundation|tennis|golf|home run club|jaguars'){ return 'Sports & Recreation' }
  if($n -match 'law enforcement|sheriff|fire fighter|fallen officers|police athletic league|wildlife enforcement|troopers'){ return 'Public Service' }
  if($n -match 'disabled|hearing impaired'){ return 'Accessibility' }
  if($n -match 'alzheimer|autism|cancer|children.?s hospital|juvenile diabetes|diabetic|blood services|organ donor|dyslexia'){ return 'Health & Family' }
  if($n -match 'government|governor|house of representative|senator'){ return 'Government & Official' }
  if($n -match 'taxi|truck|trailer|dealer|fleet|hearse|church bus|school bus|temporary|harvest permittees|street rod|historical|antique|passenger|vanity'){ return 'Special Use' }
  if($n -match 'tourism|natchez|blues|state parks|elvis'){ return 'Travel & Tourism' }
  if( -match 'national rifle association - trailer|sons of confederate veterans|mississippi toughest kids foundation|down syndrome awareness|diocese of biloxi|sunflower consolidated school preservation|state flag'){ return 'Civic & Causes' }
  return 'Civic & Causes'
}
$draft = [ordered]@{
  schemaVersion = 1
  state = 'Mississippi'
  generatedDate = '2026-03-31'
  description = 'First-pass Mississippi master draft generated from official specialty plate page. Categories and variants require human review.'
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
  $searchTerms = @($displayName.ToLowerInvariant(), $baseName.ToLowerInvariant()) | Select-Object -Unique
  $draft.plates += [ordered]@{
    id = $slug
    slug = $slug
    name = $baseName
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
    notes = 'First-pass official Mississippi scrape. Review category, search terms, and variant relationships.'
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
$draft | ConvertTo-Json -Depth 8 | Set-Content analysis\mississippi\mississippi-master-draft-2026-03-31.json


