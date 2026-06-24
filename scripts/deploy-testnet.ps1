# ForgePass — deploy verifier + registry to Stellar Testnet and initialize them.
#
# Prerequisites:
#   - Stellar CLI:  https://developers.stellar.org/docs/tools/cli/install-cli
#   - The size-optimized Wasm in artifacts/soroban/ (committed) OR a fresh build
#     under contracts/target/wasm32v1-none/release/.
#
# No secret key leaves your machine: a *local* Stellar identity is created and
# funded via Friendbot. Usage:
#
#   ./scripts/deploy-testnet.ps1 [-Identity forgepass]
#
# On success it prints the two NEXT_PUBLIC_* lines to paste into .env.local.
param([string]$Identity = "forgepass")
$ErrorActionPreference = "Stop"

$Network = "testnet"
$Root = Split-Path -Parent $PSScriptRoot

$verifierWasm = $null
$registryWasm = $null
foreach ($base in @("$Root/artifacts/soroban", "$Root/contracts/target/wasm32v1-none/release")) {
  if (-not $verifierWasm -and (Test-Path "$base/forgepass_verifier.wasm")) { $verifierWasm = "$base/forgepass_verifier.wasm" }
  if (-not $registryWasm -and (Test-Path "$base/forgepass_registry.wasm")) { $registryWasm = "$base/forgepass_registry.wasm" }
}

if (-not (Get-Command stellar -ErrorAction SilentlyContinue)) {
  throw "Stellar CLI not found. Install: https://developers.stellar.org/docs/tools/cli/install-cli"
}
if (-not $verifierWasm -or -not $registryWasm) {
  throw "Wasm artifacts not found. Run a Soroban build first (see docs/BUILD.md)."
}

Write-Host "> Network:  $Network"
Write-Host "> Identity: $Identity"
Write-Host "> Verifier: $verifierWasm"
Write-Host "> Registry: $registryWasm"

# Create + fund the identity if it does not already exist.
try { stellar keys address $Identity | Out-Null }
catch {
  Write-Host "> Generating + funding identity '$Identity' via Friendbot..."
  stellar keys generate $Identity --network $Network --fund
}
$Account = (stellar keys address $Identity).Trim()
Write-Host "> Account:  $Account"

Write-Host "> Deploying ForgePassVerifier..."
$VerifierId = (stellar contract deploy --wasm $verifierWasm --source $Identity --network $Network).Trim()
Write-Host "  -> $VerifierId"

Write-Host "> Deploying ForgePassRegistry..."
$RegistryId = (stellar contract deploy --wasm $registryWasm --source $Identity --network $Network).Trim()
Write-Host "  -> $RegistryId"

# Demo deployment: deployer holds admin AND authorized-verifier roles. In
# production these are distinct, multisig-held keys (see docs/SECURITY.md).
Write-Host "> Initializing verifier (admin = verifier = $Account)..."
stellar contract invoke --id $VerifierId --source $Identity --network $Network -- initialize --admin $Account --verifier $Account

Write-Host "> Initializing registry..."
stellar contract invoke --id $RegistryId --source $Identity --network $Network -- initialize --admin $Account --verifier $Account

Write-Host ""
Write-Host "Deployed + initialized on Stellar Testnet."
Write-Host ""
Write-Host "Paste these into .env.local (then restart 'npm run dev'):"
Write-Host ""
Write-Host "NEXT_PUBLIC_FORGEPASS_VERIFIER_ID=$VerifierId"
Write-Host "NEXT_PUBLIC_FORGEPASS_REGISTRY_ID=$RegistryId"
Write-Host ""
Write-Host "Explorer:"
Write-Host "  https://stellar.expert/explorer/testnet/contract/$VerifierId"
Write-Host "  https://stellar.expert/explorer/testnet/contract/$RegistryId"
