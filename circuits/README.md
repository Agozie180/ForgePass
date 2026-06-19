# ForgePass Noir Circuits

These circuits are the arithmetic predicate core. The production proving package
must additionally verify versioned source attestations and derive Poseidon
commitments/nullifiers using a pinned Noir/Barretenberg release. Those primitives
are deliberately not faked here: their exact API and serialization are backend
version dependent and require cross-language test vectors.

Every circuit exposes only `threshold`, `policy_commitment`, `holder_binding`,
`nullifier`, and `qualified`. A verifier must reject unless `qualified == true`
and all commitments match the requested policy/session.

Build each package with a pinned compatible `nargo` toolchain:

```bash
cd circuits/trust_score_proof
nargo test
nargo compile
```

