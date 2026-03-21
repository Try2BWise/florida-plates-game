$out = @()
$pages = @(
"universities/barry_university.html",
"universities/bethune-cookman_univ.html",
"universities/clearwater_christian_college.html",
"universities/eckerd_college.html",
"universities/edward_waters_college.html",
"universities/embry-riddle_aeronautical_university",
"universities/flagler_college.html",
"universities/florida_am_university.html",
"universities/florida_atlantic_university.html",
"universities/florida_college.html",
"universities/florida_gulf_coast_university.html",
"universities/florida_hospital_college_of_health_sciences.html",
"universities/florida_institute_of_technology.html",
"universities/florida_international_university.html",
"universities/florida_memorial_university.html",
"universities/florida_southern_college.html",
"universities/florida_state_university.html",
"universities/jacksonville_university.html",
"universities/lynn_university.html",
"universities/new_college_of_florida.html",
"universities/nova_southeastern_university.html",
"universities/palm_beach_atlantic_university.html",
"universities/ringling_school_of_art_and_design.html",
"universities/rollins_college.html",
"universities/saint_leo_university.html",
"universities/saint_thomas_university.html",
"universities/southeastern_university.html",
"universities/stetson_university.html",
"universities/university_of_central_florida.html",
"universities/university_of_florida.html",
"universities/university_of_miami.html",
"universities/university_of_north_florida.html",
"universities/university_of_south_florida.html",
"universities/university_of_tampa.html",
"universities/university_of_west_florida.html",
"universities/warner_southern_college.html"
)

$baseUrl = "http://www.flhsmv.gov/dmv/specialtytags/"

$rootProperties = @{'id'='';'plate'=''}

cd C:\HtmlAgilityPack\lib\Net40
add-type -Path .\HtmlAgilityPack.dll 
$doc = New-Object HtmlAgilityPack.HtmlDocument 

$i = 1

foreach ($p in $pages) {
    $root = New-Object PsObject -Property $rootProperties
    $root.id = $i

    $thePage = $baseUrl + $p.ToString().Trim()

    $webResult = Invoke-WebRequest -Uri $thePage -Method Get

    $result = $doc.LoadHtml($webResult.Content.ToString())
    $texts = $doc.DocumentNode.SelectSingleNode("//table[2]/tr/td/table/tr/td/center/table")
    $LicensePlate = $texts.SelectSingleNode("tbody/tr/td[3]").InnerText.Trim() 

    $DateEnacted = [datetime]$texts.SelectSingleNode("tbody/tr[3]/td[3]").InnerText.Trim()
    $DateEnacted = Get-Date $DateEnacted -Format "MM/dd/yyyy"
    $SpecialFee = $texts.SelectSingleNode("tbody/tr[4]/td[3]").InnerText.Trim() 
    $SpecialFee = $SpecialFee -replace "[.00 annual fee (plus registration fees)]",""
    $SpecialFee = $SpecialFee -replace "[$]",""

    $DistributionOfSpecialFee = $texts.SelectSingleNode("tbody/tr[5]/td[3]").InnerText.Trim()
    $DistributionOfSpecialFee = $DistributionOfSpecialFee -replace '[\r]',''
    $DistributionOfSpecialFee = $DistributionOfSpecialFee -replace '[\n]',''
    $DistributionOfSpecialFee = $DistributionOfSpecialFee -replace '\s{2,}',' '


    
    $Url = $texts.SelectSingleNode("tbody/tr[5]/td[3]").InnerHtml.Trim()
    if ($Url.ToString().Contains('<a')) {
        $UrlStart = $Url.IndexOf('<a')
        $UrlEnd = $Url.IndexOf('">')
        $UrlStart = $UrlStart + 9
        $Url = $Url.ToString().Substring($UrlStart,($UrlEnd - $UrlStart))

        $Url = $Url -replace '[\r]',''
        $Url = $Url -replace '[\n]',''
        #Write-Host $UrlStart
        #Write-Host $UrlEnd
        #Write-Host $Url
    }
    
    $image = $doc.DocumentNode.SelectSingleNode("//table[2]/tr/td/table/tr/td/center").InnerHtml
    $imageStart = $image.ToString().IndexOf('graphics/')
    $imageEnd = $image.ToString().IndexOf('.jpg')
    #Write-Host $imageStart
    #Write-Host $imageEnd 
    $image = $image.ToString().Substring($imageStart + 9, ($imageEnd - $imageStart - 9))
    #Write-Host $image.Trim()

    $imageUrl = $baseUrl + '/graphics/' + $image + '.jpg'
    $outFile = "C:\Users\bwise\Dropbox\FloridaPlates\" + $image + ".jpg"

    Invoke-WebRequest $imageUrl -OutFile $outFile

    $tempObj = New-Object PsObject -Property @{ LicensePlate = $LicensePlate; DateEnacted = $DateEnacted; SpecialFee = $SpecialFee; DistributionOfSpecialFee = $DistributionOfSpecialFee; Url = $Url; Image = $image } | 
        Select LicensePlate,DateEnacted,SpecialFee,DistributionOfSpecialFee,Url,image

    $root.plate = $tempObj

        $out += $root

    $i++
}

$out | ConvertTo-Json 