$ErrorActionPreference = "Stop"

$manifests = @(
  "artifacts/noir/SHA256SUMS",
  "artifacts/soroban/SHA256SUMS"
)

foreach ($manifest in $manifests) {
  $directory = Split-Path -Parent $manifest

  foreach ($line in Get-Content -LiteralPath $manifest) {
    if ($line -notmatch '^([a-f0-9]{64})\s+(.+)$') {
      throw "Invalid checksum line in ${manifest}: $line"
    }

    $expected = $Matches[1]
    $name = $Matches[2]
    $path = Join-Path $directory $name

    if (-not (Test-Path -LiteralPath $path)) {
      throw "Missing artifact: $path"
    }

    $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $expected) {
      throw "Checksum mismatch for ${path}: expected $expected, got $actual"
    }

    Write-Output "verified $path"
  }
}

Write-Output "All ForgePass cryptographic artifacts verified."
