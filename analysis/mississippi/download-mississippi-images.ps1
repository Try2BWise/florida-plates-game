$draft = Get-Content analysis\mississippi\mississippi-master-draft-2026-03-31.json | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path source_assets\mississippi\plates | Out-Null
$downloaded = @()
foreach($plate in $draft.plates){
  $remoteUrl = $plate.image.remoteUrl
  if([string]::IsNullOrWhiteSpace($remoteUrl)){ continue }
  $fileName = Split-Path $plate.image.path -Leaf
  $dest = Join-Path 'source_assets\mississippi\plates' $fileName
  if(Test-Path $dest){
    $downloaded += [pscustomobject]@{ name = $plate.displayName; path = $dest; status = 'existing' }
    continue
  }
  try {
    Invoke-WebRequest -UseBasicParsing $remoteUrl -OutFile $dest
    $downloaded += [pscustomobject]@{ name = $plate.displayName; path = $dest; status = 'downloaded' }
  } catch {
    $downloaded += [pscustomobject]@{ name = $plate.displayName; path = $dest; status = 'failed' }
  }
}
$downloaded | ConvertTo-Json -Depth 4 | Set-Content analysis\mississippi\image-download-report-2026-03-31.json
($downloaded | Group-Object status | Select-Object Name,Count) | ConvertTo-Json | Set-Content analysis\mississippi\image-download-summary-2026-03-31.json
