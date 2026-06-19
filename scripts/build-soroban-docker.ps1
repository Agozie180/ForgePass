$ErrorActionPreference = "Stop"

docker build `
  --file toolchains/soroban.Dockerfile `
  --tag forgepass-soroban:1.93.1 `
  .

docker run --rm `
  --volume "${PWD}:/workspace" `
  --volume "forgepass-cargo-registry:/usr/local/cargo/registry" `
  forgepass-soroban:1.93.1

if ($LASTEXITCODE -ne 0) {
  throw "Soroban build failed with exit code $LASTEXITCODE"
}
