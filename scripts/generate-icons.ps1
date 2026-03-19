Add-Type -AssemblyName System.Drawing

$src  = "C:\John\Works\EcoEnv\Jeety\Graphics\PNG\Icon jeety bleu prime V1.png"
$dest = "C:\John\Works\EcoEnv\Jeety\jeety-focus\assets\images"

function Make-Icon {
    param(
        [string]$srcPath,
        [int]$w, [int]$h,
        [string]$outPath,
        [System.Drawing.Color]$bg,
        [int]$imgX = 0, [int]$imgY = 0,
        [int]$imgW = -1, [int]$imgH = -1
    )
    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    if ($imgW -lt 0) { $imgW = $w }
    if ($imgH -lt 0) { $imgH = $h }
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear($bg)
    $g.DrawImage($srcImg, $imgX, $imgY, $imgW, $imgH)
    $g.Dispose()
    $srcImg.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "OK: $(Split-Path $outPath -Leaf)"
}

# 1. iOS / generic icon — 1024x1024 white background
Make-Icon $src 1024 1024 "$dest\icon.png" ([System.Drawing.Color]::White)

# 2. Android adaptive foreground — 1024x1024 transparent, logo in safe zone (66%)
Make-Icon $src 1024 1024 "$dest\android-icon-foreground.png" ([System.Drawing.Color]::Transparent) 174 174 676 676

# 3. Android adaptive background — 1024x1024 solid #E6F4FE
$bmpBg = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gBg = [System.Drawing.Graphics]::FromImage($bmpBg)
$gBg.Clear([System.Drawing.Color]::FromArgb(255, 230, 244, 254))
$gBg.Dispose()
$bmpBg.Save("$dest\android-icon-background.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmpBg.Dispose()
Write-Host "OK: android-icon-background.png"

# 4. Android monochrome — 1024x1024 grayscale, safe zone
$srcM = [System.Drawing.Image]::FromFile($src)
$bmpM = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gM   = [System.Drawing.Graphics]::FromImage($bmpM)
$gM.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gM.Clear([System.Drawing.Color]::Transparent)
$cmData = [float[][]]@(
    [float[]]@(0.299, 0.299, 0.299, 0, 0),
    [float[]]@(0.587, 0.587, 0.587, 0, 0),
    [float[]]@(0.114, 0.114, 0.114, 0, 0),
    [float[]]@(0, 0, 0, 1, 0),
    [float[]]@(0, 0, 0, 0, 1)
)
$cm = New-Object System.Drawing.Imaging.ColorMatrix(,$cmData)
$ia = New-Object System.Drawing.Imaging.ImageAttributes
$ia.SetColorMatrix($cm)
$rect = New-Object System.Drawing.Rectangle(174, 174, 676, 676)
$gM.DrawImage($srcM, $rect, 0, 0, $srcM.Width, $srcM.Height, [System.Drawing.GraphicsUnit]::Pixel, $ia)
$gM.Dispose(); $ia.Dispose(); $srcM.Dispose()
$bmpM.Save("$dest\android-icon-monochrome.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmpM.Dispose()
Write-Host "OK: android-icon-monochrome.png"

# 5. Favicon — 196x196 transparent
Make-Icon $src 196 196 "$dest\favicon.png" ([System.Drawing.Color]::Transparent)

# 6. Splash icon — 512x512 transparent (Expo centers it on the background)
Make-Icon $src 512 512 "$dest\splash-icon.png" ([System.Drawing.Color]::Transparent)

Write-Host ""
Write-Host "All icons generated successfully!"
