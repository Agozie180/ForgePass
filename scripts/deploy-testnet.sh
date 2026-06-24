#!/usr/bin/env bash
# ForgePass — deploy verifier + registry to Stellar Testnet and initialize them.
#
# Prerequisites:
#   - Stellar CLI:  https://developers.stellar.org/docs/tools/cli/install-cli
#                   (`stellar --version` should work)
#   - The size-optimized Wasm in artifacts/soroban/ (committed) OR a fresh build
#     under contracts/target/wasm32v1-none/release/.
#
# No secret key ever leaves your machine: the script creates/uses a *local*
# Stellar identity and funds it via Friendbot. Usage:
#
#   ./scripts/deploy-testnet.sh [IDENTITY_NAME]   # default: forgepass
#
# On success it prints the two NEXT_PUBLIC_* lines to paste into .env.local.
set -euo pipefail

NETWORK="testnet"
IDENTITY="${1:-forgepass}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

VERIFIER_WASM=""
REGISTRY_WASM=""
for base in "$ROOT/artifacts/soroban" "$ROOT/contracts/target/wasm32v1-none/release"; do
  [ -f "$base/forgepass_verifier.wasm" ] && VERIFIER_WASM="$base/forgepass_verifier.wasm"
  [ -f "$base/forgepass_registry.wasm" ] && REGISTRY_WASM="$base/forgepass_registry.wasm"
  [ -n "$VERIFIER_WASM" ] && [ -n "$REGISTRY_WASM" ] && break
done

if ! command -v stellar >/dev/null 2>&1; then
  echo "✗ Stellar CLI not found. Install: https://developers.stellar.org/docs/tools/cli/install-cli" >&2
  exit 1
fi
if [ -z "$VERIFIER_WASM" ] || [ -z "$REGISTRY_WASM" ]; then
  echo "✗ Wasm artifacts not found. Run a Soroban build first (see docs/BUILD.md)." >&2
  exit 1
fi

echo "▶ Network:   $NETWORK"
echo "▶ Identity:  $IDENTITY"
echo "▶ Verifier:  $VERIFIER_WASM"
echo "▶ Registry:  $REGISTRY_WASM"

# Create + fund the identity if it does not already exist.
if ! stellar keys address "$IDENTITY" >/dev/null 2>&1; then
  echo "▶ Generating + funding identity '$IDENTITY' via Friendbot…"
  stellar keys generate "$IDENTITY" --network "$NETWORK" --fund
fi
ACCOUNT="$(stellar keys address "$IDENTITY")"
echo "▶ Account:   $ACCOUNT"

echo "▶ Deploying ForgePassVerifier…"
VERIFIER_ID="$(stellar contract deploy --wasm "$VERIFIER_WASM" --source "$IDENTITY" --network "$NETWORK")"
echo "  → $VERIFIER_ID"

echo "▶ Deploying ForgePassRegistry…"
REGISTRY_ID="$(stellar contract deploy --wasm "$REGISTRY_WASM" --source "$IDENTITY" --network "$NETWORK")"
echo "  → $REGISTRY_ID"

# For the demo deployment the deployer holds the admin AND authorized-verifier
# roles. In production these are distinct, multisig-held keys (see docs/SECURITY.md).
echo "▶ Initializing verifier (admin = verifier = $ACCOUNT)…"
stellar contract invoke --id "$VERIFIER_ID" --source "$IDENTITY" --network "$NETWORK" \
  -- initialize --admin "$ACCOUNT" --verifier "$ACCOUNT"

echo "▶ Initializing registry…"
stellar contract invoke --id "$REGISTRY_ID" --source "$IDENTITY" --network "$NETWORK" \
  -- initialize --admin "$ACCOUNT" --verifier "$ACCOUNT"

cat <<EOF

✓ Deployed + initialized on Stellar Testnet.

Paste these into .env.local (then restart \`npm run dev\`):

NEXT_PUBLIC_FORGEPASS_VERIFIER_ID=$VERIFIER_ID
NEXT_PUBLIC_FORGEPASS_REGISTRY_ID=$REGISTRY_ID

Explorer:
  https://stellar.expert/explorer/testnet/contract/$VERIFIER_ID
  https://stellar.expert/explorer/testnet/contract/$REGISTRY_ID
EOF
