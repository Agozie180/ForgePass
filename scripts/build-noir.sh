#!/usr/bin/env sh
set -eu

NARGO="${NARGO:-nargo}"
CIRCUITS="income_proof balance_proof account_age_proof transaction_volume_proof trust_score_proof"

"$NARGO" --version

for circuit in $CIRCUITS; do
  echo "==> Noir: $circuit"
  (
    cd "/workspace/circuits/$circuit"
    "$NARGO" test
    "$NARGO" compile
  )
done

echo "All ForgePass Noir circuits compiled successfully."
