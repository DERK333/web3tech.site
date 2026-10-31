import { secrets } from "base44:runtime";

// Per-user broker credentials.
//
// Every app user stores their own Kraken / Alpaca keys. The values are sealed
// with AES-GCM before they are written to the database, so even a direct read
// of the record yields ciphertext, and no function ever hands a key back to a
// browser — only a masked hint.

const encoder = new TextEncoder();

const b64FromBytes = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

const bytesFromB64 = (b64) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

const sealingKey = async () => {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secrets.get("CONFIRM_LINK_SECRET") || "insight-hub-broker-vault"),
    "HKDF",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode("insight-hub-broker-credentials"),
      info: encoder.encode("broker-keys"),
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const sealSecret = async (plain) => {
  const value = String(plain || "").trim();
  if (!value) return "";
  const key = await sealingKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const sealed = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(value));
  return `v1.${b64FromBytes(iv)}.${b64FromBytes(sealed)}`;
};

export const openSecret = async (payload) => {
  if (!payload) return "";
  const [version, ivPart, dataPart] = String(payload).split(".");
  if (version !== "v1" || !ivPart || !dataPart) return "";
  try {
    const key = await sealingKey();
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytesFromB64(ivPart) },
      key,
      bytesFromB64(dataPart)
    );
    return new TextDecoder().decode(plain);
  } catch {
    return "";
  }
};

export const lastFour = (value) => (value ? `••••${String(value).slice(-4)}` : null);

const pair = async (key, secret, hint) => ({
  key: key ? await openSecret(key) : "",
  secret: secret ? await openSecret(secret) : "",
  hint: hint || null,
});

// The broker connection belonging to one app user. Service role only.
export const loadBrokerCredentials = async (sr, userId) => {
  if (!userId) return { kraken: { key: "", secret: "", hint: null }, alpaca: { key: "", secret: "", hint: null } };
  const records = await sr.entities.BrokerCredential.filter({ owner_id: userId });
  const record = records?.[0] || null;
  if (!record) {
    return { kraken: { key: "", secret: "", hint: null }, alpaca: { key: "", secret: "", hint: null } };
  }
  return {
    kraken: await pair(record.kraken_key, record.kraken_secret, record.kraken_hint),
    alpaca: await pair(record.alpaca_key, record.alpaca_secret, record.alpaca_hint),
  };
};

export const hasKeys = (creds) => Boolean(creds?.key && creds?.secret);