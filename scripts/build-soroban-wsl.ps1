$ErrorActionPreference = "Stop"

$workspace = (Resolve-Path ".").Path
$wslWorkspace = (wsl.exe wslpath -a $workspace).Trim()

wsl.exe -e bash -lc "rustup target add wasm32v1-none && SOURCE_ROOT='$wslWorkspace' BUILD_ROOT=\"`$HOME/.cache/forgepass-contracts-build\" '$wslWorkspace/scripts/build-soroban.sh'"

if ($LASTEXITCODE -ne 0) {
  throw "Soroban build failed with exit code $LASTEXITCODE"
}
