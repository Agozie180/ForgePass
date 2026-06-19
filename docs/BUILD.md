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
65acbea6aeabe7a35c429e27d47212cb96c7da4c8e8228b46708e039f55ff573  forgepass_verifier.wasm
c9a0fcf923b1a9b41ef8962fb0159d5e657bdee5fb96f8d0a74d91a71593e2dd  forgepass_registry.wasm
```

These hashes identify the local release build. Rebuilding from the pinned source
should be functionally reproducible; byte-for-byte reproducibility also requires
the same Rust, dependency lockfile, target, linker, and build environment.
