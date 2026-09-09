param([Parameter(Mandatory = $true)][string]$PastaDasFontes)

# Derivado integral do símbolo oficial: redimensiona, sem recorte/recoloração.
# O original fica no corpus; o PNG novo contém apenas os pixels renderizados.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$origem = Join-Path $PastaDasFontes 'identidade-visual/observatorio/icon.png'
$hashEsperado = '6b230265d3c50b864bed83c5d3e7ddd02bd01998a92de818fefae487afc2571b'
if ((Get-FileHash -LiteralPath $origem -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hashEsperado) {
    throw 'O símbolo oficial mudou; confira a origem antes de gerar outro derivado.'
}
$destino = Join-Path $PSScriptRoot '../public/media/logos/observatorio-simbolo-256.png'
$imagem = [System.Drawing.Image]::FromFile($origem)
$reduzida = [System.Drawing.Bitmap]::new(256, 320)
$grafico = [System.Drawing.Graphics]::FromImage($reduzida)
try {
    if ($imagem.Width -ne 1080 -or $imagem.Height -ne 1350) {
        throw 'Dimensões inesperadas para icon.png.'
    }
    $grafico.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $grafico.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $grafico.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $grafico.DrawImage($imagem, [System.Drawing.Rectangle]::new(0, 0, 256, 320))
    $reduzida.Save($destino, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
    $grafico.Dispose()
    $reduzida.Dispose()
    $imagem.Dispose()
}
Get-Item -LiteralPath $destino | Select-Object Name, Length
Write-Output (Get-FileHash -LiteralPath $destino -Algorithm SHA256).Hash
