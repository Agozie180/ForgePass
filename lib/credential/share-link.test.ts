import { describe, expect, it } from "vitest";
import { decodeSharedCredentialParam, getSharedCredentialTxHash, parseSharedCredentialRoute } from "./share-link";

const validPayload = {
  id: "fp_test_123",
  policy: "Marketplace Trust",
  holder: "GDUKMGUGDZQK6Y3VQ2S56JTZG5V3FQHT5POA3U63F4QHZ2TVN7QJUDGE",
  network: "TESTNET",
  proof: "abc123def4567890",
  claims: ["score", "income", "balance"],
  ts: "2026-06-27T10:00:00.000Z",
};

function encodePayload(payload: unknown) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

describe("shared ForgePass credential links", () => {
  it("routes a valid fp link to the public credential view", () => {
    const route = parseSharedCredentialRoute(encodePayload(validPayload));

    expect(route.kind).toBe("credential");
    if (route.kind !== "credential") throw new Error("expected credential route");
    expect(route.credential).toMatchObject(validPayload);
  });

  it("routes an invalid fp link to the invalid credential view", () => {
    const route = parseSharedCredentialRoute("not-valid-base64-json");

    expect(route.kind).toBe("invalid");
  });

  it("routes a missing fp link to the normal app", () => {
    const route = parseSharedCredentialRoute(undefined);

    expect(route.kind).toBe("normal");
  });

  it("rejects payloads missing required public fields", () => {
    expect(decodeSharedCredentialParam(encodePayload({ ...validPayload, proof: "" }))).toBeNull();
    expect(decodeSharedCredentialParam(encodePayload({ ...validPayload, claims: ["score", 91] }))).toBeNull();
  });

  it("accepts optional fresh verification transaction hashes", () => {
    const txHash = "733a10034fbd11cb8a588d7fcc98af30a9d25f7d844c4a2beca65fd15f5a61f5";
    const credential = decodeSharedCredentialParam(encodePayload({ ...validPayload, txHash }));

    expect(credential).not.toBeNull();
    expect(getSharedCredentialTxHash(credential!)).toBe(txHash);
  });
});

