$ErrorActionPreference = "Stop"

docker build `
  --file toolchains/noir.Dockerfile `
  --tag forgepass-noir:1.0.0-beta.9 `
  .

docker run --rm `
  --volume "${PWD}:/workspace" `
  --workdir /workspace `
  --entrypoint sh `
  forgepass-noir:1.0.0-beta.9 `
  scripts/build-noir.sh
