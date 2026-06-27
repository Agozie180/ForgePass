export type SharedCredentialPayload = {
  id: string;
  policy: string;
  holder: string;
  network: string;
  proof: string;
  claims: string[];
  ts: string;
  tx?: string;
  txHash?: string;
};

export type SharedCredentialRoute =
  | { kind: "normal" }
  | { kind: "invalid" }
  | { kind: "credential"; credential: SharedCredentialPayload };

const REQUIRED_STRING_FIELDS = ["id", "policy", "holder", "network", "proof", "ts"] as const;

export function parseSharedCredentialRoute(fp: string | string[] | null | undefined): SharedCredentialRoute {
  if (fp === undefined || fp === null) return { kind: "normal" };
  const credential = decodeSharedCredentialParam(fp);
  return credential ? { kind: "credential", credential } : { kind: "invalid" };
}

export function decodeSharedCredentialParam(fp: string | string[] | null | undefined): SharedCredentialPayload | null {
  const raw = Array.isArray(fp) ? fp[0] : fp;
  if (!raw || typeof raw !== "string") return null;

  try {
    const json = decodeBase64Json(raw);
    const parsed: unknown = JSON.parse(json);
    return validateSharedCredentialPayload(parsed);
  } catch {
    return null;
  }
}

export function getSharedCredentialTxHash(credential: SharedCredentialPayload): string | null {
  const value = credential.txHash ?? credential.tx;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function formatSharedCredentialClaim(claim: string): string {
  const labels: Record<string, string> = {
    accountAge: "Account age requirement met",
    activity: "Activity requirement met",
    balance: "Balance requirement met",
    consistency: "Consistency requirement met",
    income: "Income requirement met",
    score: "Score threshold met",
  };
  return labels[claim] ?? claim.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
}

function decodeBase64Json(value: string): string {
  const normalized = decodeURIComponent(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function validateSharedCredentialPayload(value: unknown): SharedCredentialPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;

  for (const field of REQUIRED_STRING_FIELDS) {
    if (!isNonEmptyString(candidate[field])) return null;
  }

  if (!Array.isArray(candidate.claims) || !candidate.claims.every(isNonEmptyString)) return null;

  return {
    id: (candidate.id as string).trim(),
    policy: (candidate.policy as string).trim(),
    holder: (candidate.holder as string).trim(),
    network: (candidate.network as string).trim(),
    proof: (candidate.proof as string).trim(),
    claims: candidate.claims.map((claim) => claim.trim()),
    ts: (candidate.ts as string).trim(),
    tx: isNonEmptyString(candidate.tx) ? candidate.tx.trim() : undefined,
    txHash: isNonEmptyString(candidate.txHash) ? candidate.txHash.trim() : undefined,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

