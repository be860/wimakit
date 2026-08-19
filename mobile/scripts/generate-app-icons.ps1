<#
.SYNOPSIS
  Generates the WiMakit app icon assets from the brand cart mark.

.DESCRIPTION
  Composites the brand cart mark onto square 1024x1024 white canvases,
  preserving aspect ratio and leaving the padding each platform needs:

    app-icon.png             artwork at 80% width
                             -> iOS / base icon. iOS forbids alpha, hence the
                                opaque white ground.

    app-icon-foreground.png  artwork at 66% width
                             -> Android adaptive-icon foreground. Launchers mask
                                the outer ~33% (circle, squircle, rounded
                                square), so artwork outside the central safe
                                zone gets clipped. Kept opaque white to match
                                adaptiveIcon.backgroundColor (#FFFFFF) -- that
                                avoids the halo that chroma-keying a lossy JPEG
                                background to alpha would leave behind.

  Both outputs are cropped to the source's measured ink bounds first, so the
  scale factors refer to the artwork itself rather than to whatever margin the
  export happened to include.

  Re-run after changing the source logo, then `npx expo prebuild --clean`
  so the native android/ project picks the new icons up.
#>

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$imagesDir = Join-Path $PSScriptRoot '..\assets\images'
$sourcePath = Join-Path $imagesDir 'wimakit-mobile-app-logo.jpeg'

if (-not (Test-Path $sourcePath)) {
    throw "Source logo not found at $sourcePath"
}

$CANVAS = 1024

# The source has a wide empty margin baked in. Measure the real ink bounds so the
# $Scale values below refer to the artwork itself rather than to the artwork plus
# whatever padding the export happened to include. A pixel counts as ink when it
# is neither transparent nor near-white, which covers both a transparent PNG and
# a white-ground JPEG (whose background is not exactly 255 after compression).
function Get-InkBounds {
    param([Parameter(Mandatory)] [System.Drawing.Bitmap] $Bitmap)

    $minX = $Bitmap.Width; $minY = $Bitmap.Height; $maxX = -1; $maxY = -1
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
        for ($x = 0; $x -lt $Bitmap.Width; $x++) {
            $c = $Bitmap.GetPixel($x, $y)
            $isBackground = ($c.A -le 8) -or (($c.R -ge 245) -and ($c.G -ge 245) -and ($c.B -ge 245))
            if (-not $isBackground) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    if ($maxX -lt 0) { throw 'Source image contains no artwork (fully blank).' }

    New-Object System.Drawing.Rectangle($minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1))
}

function New-AppIcon {
    param(
        [Parameter(Mandatory)] [System.Drawing.Image] $Source,
        [Parameter(Mandatory)] [System.Drawing.Rectangle] $SourceRect,
        [Parameter(Mandatory)] [string] $OutputPath,
        # Fraction of the canvas the artwork's longest edge may occupy.
        [Parameter(Mandatory)] [double] $Scale,
        # Empty leaves the background transparent.
        [System.Drawing.Color] $Background = [System.Drawing.Color]::Empty
    )

    $bitmap = New-Object System.Drawing.Bitmap($CANVAS, $CANVAS, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        if ($Background -ne [System.Drawing.Color]::Empty) {
            $graphics.Clear($Background)
        } else {
            $graphics.Clear([System.Drawing.Color]::Transparent)
        }

        # Fit the cropped artwork inside a Scale x Scale box, preserving aspect ratio.
        $box = $CANVAS * $Scale
        $ratio = [Math]::Min($box / $SourceRect.Width, $box / $SourceRect.Height)
        $width  = [Math]::Round($SourceRect.Width  * $ratio)
        $height = [Math]::Round($SourceRect.Height * $ratio)
        $x = [Math]::Round(($CANVAS - $width)  / 2)
        $y = [Math]::Round(($CANVAS - $height) / 2)

        $destRect = New-Object System.Drawing.Rectangle($x, $y, $width, $height)
        $graphics.DrawImage($Source, $destRect, $SourceRect, [System.Drawing.GraphicsUnit]::Pixel)
        $graphics.Flush()

        $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host ("  {0,-26} {1}x{2} logo {3}x{4} at ({5},{6})" -f (Split-Path $OutputPath -Leaf), $CANVAS, $CANVAS, $width, $height, $x, $y)
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

# Fails the run if any artwork would be cropped by a circular launcher mask.
function Assert-SafeZone {
    param([Parameter(Mandatory)] [string] $Path)

    $bitmap = New-Object System.Drawing.Bitmap($Path)
    try {
        $centre = $CANVAS / 2.0
        $safeRadius = $CANVAS * (72.0 / 108.0) / 2.0
        $maxRadius = 0.0
        $clipped = 0

        for ($y = 0; $y -lt $bitmap.Height; $y++) {
            for ($x = 0; $x -lt $bitmap.Width; $x++) {
                $c = $bitmap.GetPixel($x, $y)
                if (($c.R -lt 240) -or ($c.G -lt 240) -or ($c.B -lt 240)) {
                    $r = [Math]::Sqrt([Math]::Pow($x - $centre, 2) + [Math]::Pow($y - $centre, 2))
                    if ($r -gt $maxRadius) { $maxRadius = $r }
                    if ($r -gt $safeRadius) { $clipped++ }
                }
            }
        }

        if ($clipped -gt 0) {
            throw ("Adaptive foreground exceeds the circular safe zone: {0} px of artwork sit beyond r={1:N0} (furthest r={2:N0}). Lower the foreground -Scale." -f $clipped, $safeRadius, $maxRadius)
        }

        Write-Host ("  safe-zone check            OK (furthest ink r={0:N0}, limit r={1:N0})" -f $maxRadius, $safeRadius)
    }
    finally {
        $bitmap.Dispose()
    }
}

$source = New-Object System.Drawing.Bitmap($sourcePath)
try {
    $ink = Get-InkBounds -Bitmap $source
    Write-Host "Source: $(Split-Path $sourcePath -Leaf) ($($source.Width)x$($source.Height)), ink $($ink.Width)x$($ink.Height) at ($($ink.X),$($ink.Y))"
    Write-Host "Generating:"

    # 70% -- iOS applies only a rounded-rect mask, so a modest margin is enough.
    # Trimmed down from 0.80 -- on device the artwork read as crowding the
    # rounded corners with too little breathing room.
    New-AppIcon -Source $source -SourceRect $ink `
                -OutputPath (Join-Path $imagesDir 'app-icon.png') `
                -Scale 0.70 `
                -Background ([System.Drawing.Color]::White)

    # 50% -- Android guarantees only the inner 72/108 of the canvas survives the
    # launcher mask, and on a circular mask (Pixel) that guarantee is a circle of
    # radius 341px, not a 683px square. A 1.2:1 logo scaled to the full 66% square
    # pushes its widest ink out to r=378 and loses the lettuce tip. Trimmed from
    # 0.59 (which only just inscribed the diagonal in that circle, leaving barely
    # any margin) down to 0.50 for a visibly centered icon with real white space
    # around it; verified by the safe-zone check below, which must report zero
    # clipped pixels.
    New-AppIcon -Source $source -SourceRect $ink `
                -OutputPath (Join-Path $imagesDir 'app-icon-foreground.png') `
                -Scale 0.50 `
                -Background ([System.Drawing.Color]::White)

    Assert-SafeZone -Path (Join-Path $imagesDir 'app-icon-foreground.png')

    Write-Host "Done. Run 'npx expo prebuild --clean' to rebuild native icons."
}
finally {
    $source.Dispose()
}
