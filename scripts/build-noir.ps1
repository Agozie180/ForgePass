$ErrorActionPreference = "Stop"

docker build `
  --file toolchains/noir.Dockerfile `
  --tag forgepass-noir:1.0.0-beta.22 `
  .

docker run --rm `
  --volume "${PWD}:/workspace" `
  --workdir /workspace `
  --entrypoint sh `
  forgepass-noir:1.0.0-beta.22 `
  scripts/build-noir.sh
