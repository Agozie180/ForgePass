export type ProofRunStatus = "idle" | "generating" | "success" | "failed" | "not-supported";

export type ProofRunState = {
  status: ProofRunStatus;
  message: string;
  error?: string;
};

export const INITIAL_PROOF_RUN_STATE: ProofRunState = {
  status: "idle",
  message: "Fresh browser proof generation status: not started",
};

export type ProofRunEvent =
  | { type: "start"; message?: string }
  | { type: "progress"; message: string }
  | { type: "success"; message?: string }
  | { type: "error"; error: string; notSupported?: boolean }
  | { type: "reset" };

export function reduceProofRunState(state: ProofRunState, event: ProofRunEvent): ProofRunState {
  switch (event.type) {
    case "start":
      return { status: "generating", message: event.message ?? "Generating UltraHonk proof..." };
    case "progress":
      return { ...state, message: event.message };
    case "success":
      return { status: "success", message: event.message ?? "Fresh browser proof generation status: success" };
    case "error":
      return {
        status: event.notSupported ? "not-supported" : "failed",
        message: event.notSupported
          ? "Browser proving could not complete on this device. Use verified milestone transaction or run local prover."
          : "Fresh browser proof generation status: failed",
        error: event.error,
      };
    case "reset":
      return INITIAL_PROOF_RUN_STATE;
    default:
      return state;
  }
}

export function isBrowserProofUnsupportedError(message: string): boolean {
  const normalized = message.toLowerCase();
  return [
    "timeout",
    "timed out",
    "out of memory",
    "memory",
    "allocation",
    "wasm",
    "webassembly",
    "worker",
    "sharedarraybuffer",
    "could not complete",
  ].some((needle) => normalized.includes(needle));
}
