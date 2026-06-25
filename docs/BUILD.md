# ForgePass Cryptography Build

ForgePass pins both compiler stacks and produces verifiable artifacts without
requiring host installations.

## Noir

- Nargo/Noirc: `v1.0.0-beta.22`
- Image definition: `toolchains/noir.Dockerfile`
- Packages: income, balance, account age, transaction volume, trust score

```powershell
.\scripts\build-noir.ps1
```

The command builds the pinned image, runs every circuit test, and compiles every
circuit. ACIR artifacts are emitted below each circuit's ignored `target/`
directory. The Trust Score suite includes a canonical score-91 success case and
an expected-failure case proving a low score cannot claim qualification.

## Soroban

- Rust: `1.93.1`
- Soroban SDK: `22.0.11` (resolved by `contracts/Cargo.lock`)
- Target: `wasm32v1-none`
- Profile: size optimized, LTO, overflow checks, abort-on-panic

On Windows with WSL:

```powershell
.\scripts\build-soroban-wsl.ps1
```

Or with Docker:

```powershell
.\scripts\build-soroban-docker.ps1
```

The build copies source to a native Linux build directory to avoid expensive
OneDrive filesystem translation, compiles with one worker for predictable memory
use, and writes deployable binaries plus `SHA256SUMS` to `artifacts/soroban/`.

## Verified artifacts

```text
feb99d3b55bb420d16c3d458e6e591a3dee61f83b72ee0a03927a77fe8e3e089  forgepass_verifier.wasm
d61a5397e8df843ddc54507b61847737f40d7ac70bafb69fca18bfc0ea7aac36  forgepass_registry.wasm
```

These hashes identify the local release build. Rebuilding from the pinned source
should be functionally reproducible; byte-for-byte reproducibility also requires
the same Rust, dependency lockfile, target, linker, and build environment.
