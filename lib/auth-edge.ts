const encoder = new TextEncoder();

function base64urlFromBytes(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function decodeBase64url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

async function hmac(payloadBase64: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadBase64),
  );
  return base64urlFromBytes(new Uint8Array(signature));
}

export async function verifySessionTokenEdge(token?: string | null) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !token || !token.includes(".")) return false;

  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return false;

  const expected = await hmac(payloadBase64, secret);
  if (expected !== signature) return false;

  try {
    const payload = JSON.parse(decodeBase64url(payloadBase64)) as {
      exp?: number;
    };
    return Boolean(payload.exp && payload.exp >= Math.floor(Date.now() / 1000));
  } catch {
    return false;
  }
}
