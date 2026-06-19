#!/usr/bin/env sh
set -eu

SOURCE_ROOT="${SOURCE_ROOT:-/workspace}"
BUILD_ROOT="${BUILD_ROOT:-/tmp/forgepass-contracts-build}"
OUTPUT_ROOT="${OUTPUT_ROOT:-$SOURCE_ROOT/artifacts/soroban}"

rm -rf "$BUILD_ROOT"
mkdir -p "$BUILD_ROOT" "$OUTPUT_ROOT"
cp -R "$SOURCE_ROOT/contracts/." "$BUILD_ROOT/"

cd "$BUILD_ROOT"
cargo build --locked --jobs 1 --target wasm32v1-none --release

cp target/wasm32v1-none/release/forgepass_verifier.wasm "$OUTPUT_ROOT/"
cp target/wasm32v1-none/release/forgepass_registry.wasm "$OUTPUT_ROOT/"

cd "$OUTPUT_ROOT"
sha256sum forgepass_verifier.wasm forgepass_registry.wasm > SHA256SUMS
cat SHA256SUMS
echo "ForgePass Soroban contracts compiled successfully."
