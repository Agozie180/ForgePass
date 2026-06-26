import { describe, expect, it } from "vitest";
import { INITIAL_PROOF_RUN_STATE, isBrowserProofUnsupportedError, reduceProofRunState } from "./proof-state";

describe("proof run state", () => {
  it("transitions idle -> generating -> success", () => {
    const generating = reduceProofRunState(INITIAL_PROOF_RUN_STATE, { type: "start" });
    expect(generating).toEqual({ status: "generating", message: "Generating UltraHonk proof..." });

    const success = reduceProofRunState(generating, { type: "success" });
    expect(success.status).toBe("success");
    expect(success.message).toBe("Fresh browser proof generation status: success");
  });

  it("transitions idle -> generating -> error", () => {
    const generating = reduceProofRunState(INITIAL_PROOF_RUN_STATE, { type: "start" });
    const failed = reduceProofRunState(generating, { type: "error", error: "Noir witness generation failed" });

    expect(failed.status).toBe("failed");
    expect(failed.error).toBe("Noir witness generation failed");
    expect(failed.message).toBe("Fresh browser proof generation status: failed");
  });

  it("marks memory, wasm, and timeout failures as not supported", () => {
    expect(isBrowserProofUnsupportedError("Proof generation timed out after 45 seconds")).toBe(true);
    expect(isBrowserProofUnsupportedError("WebAssembly memory allocation failed")).toBe(true);
    expect(isBrowserProofUnsupportedError("Freighter rejected the transaction")).toBe(false);
  });
});
