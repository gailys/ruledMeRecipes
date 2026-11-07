# Render the editable cupcake artwork to opaque PNGs for Android and iOS.
Add-Type -AssemblyName System.Drawing
$iconRoot = Join-Path $PSScriptRoot '..\icons'
function New-CupcakePng([int]$size,[string]$name) {
  $bitmap = New-Object System.Drawing.Bitmap($size,$size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#173f35'))
  $graphics.ScaleTransform(($size/512.0),($size/512.0))
  function Fill-Shape($shape,$color) {
    $brush=New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($color))
    $graphics.FillPath($brush,$shape);$brush.Dispose();$shape.Dispose()
  }
  function Stroke-Shape($shape,$color,$width) {
    $pen=New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($color)),$width
    $pen.StartCap=[System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap=[System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawPath($pen,$shape);$pen.Dispose();$shape.Dispose()
  }
  $shape=New-Object System.Drawing.Drawing2D.GraphicsPath
  $shape.AddLine(155,294,357,294);$shape.AddLine(357,294,333,389)
  $shape.AddBezier(333,389,330,401,325,401,317,401)
  $shape.AddLine(317,401,195,401);$shape.AddBezier(195,401,182,401,182,398,179,389)
  $shape.CloseFigure();Fill-Shape $shape '#eea574'
  foreach($line in @(@(209,314,219,379),@(256,314,256,379),@(303,314,293,379))) {
    $shape=New-Object System.Drawing.Drawing2D.GraphicsPath
    $shape.AddLine($line[0],$line[1],$line[2],$line[3]);Stroke-Shape $shape '#c7774c' 12
  }
  $shape=New-Object System.Drawing.Drawing2D.GraphicsPath
  $shape.AddBezier(155,301,124,301,121,259,147,246)
  $shape.AddBezier(147,246,137,219,158,192,184,194)
  $shape.AddBezier(184,194,181,164,206,143,231,148)
  $shape.AddBezier(231,148,240,126,267,122,283,141)
  $shape.AddBezier(283,141,305,144,321,161,320,184)
  $shape.AddBezier(320,184,348,181,371,208,360,234)
  $shape.AddBezier(360,234,391,250,382,293,357,301)
  $shape.CloseFigure();Fill-Shape $shape '#f7f0d9'
  $shape=New-Object System.Drawing.Drawing2D.GraphicsPath
  $shape.AddBezier(183,247,230,266,279,266,330,240)
  $shape.StartFigure();$shape.AddBezier(207,196,238,210,269,210,299,193)
  Stroke-Shape $shape '#e1d6b6' 12
  $shape=New-Object System.Drawing.Drawing2D.GraphicsPath
  $shape.AddEllipse(233,103,46,46);Fill-Shape $shape '#ee8358'
  $shape=New-Object System.Drawing.Drawing2D.GraphicsPath
  $shape.AddBezier(259,105,262,92,270,85,282,85);Stroke-Shape $shape '#d9f36a' 10
  $bitmap.Save((Join-Path $iconRoot $name),[System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose();$bitmap.Dispose()
}
New-CupcakePng 192 'cupcake-192.png'
New-CupcakePng 512 'cupcake-512.png'
New-CupcakePng 180 'apple-touch-icon-cupcake.png'
# Keep old URLs useful for browsers which still hold the previous manifest.
Copy-Item -LiteralPath (Join-Path $iconRoot 'cupcake-192.png') -Destination (Join-Path $iconRoot 'icon-192.png') -Force
Copy-Item -LiteralPath (Join-Path $iconRoot 'cupcake-512.png') -Destination (Join-Path $iconRoot 'icon-512.png') -Force
