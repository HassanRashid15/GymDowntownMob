import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const generateTotpSecret = async (length = 20) => {
  const bytes = await Crypto.getRandomBytesAsync(length);
  return base32Encode(bytes);
};

const base32Encode = (bytes: Uint8Array) => {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
};

const base32Decode = (input: string) => {
  const normalized = input.replace(/=+$/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
};

const counterToBytes = (counter: number) => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  const high = Math.floor(counter / 0x100000000);
  const low = counter % 0x100000000;
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);
  return new Uint8Array(buffer);
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const hmacSha1 = async (key: Uint8Array, message: Uint8Array) => {
  if (typeof globalThis.crypto?.subtle !== 'undefined') {
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      'raw',
      toArrayBuffer(key),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const signature = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, toArrayBuffer(message));
    return new Uint8Array(signature);
  }

  throw new Error('HMAC is not available on this platform.');
};

export const generateTotpCode = async (
  secret: string,
  options?: { interval?: number; digits?: number; timestamp?: number }
) => {
  const interval = options?.interval ?? 30;
  const digits = options?.digits ?? 6;
  const timestamp = options?.timestamp ?? Date.now();
  const counter = Math.floor(timestamp / 1000 / interval);
  const key = base32Decode(secret);
  const message = counterToBytes(counter);
  const hmac = await hmacSha1(key, message);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = (binary % 10 ** digits).toString().padStart(digits, '0');
  return otp;
};

export const verifyTotpCode = async (
  secret: string,
  code: string,
  options?: { interval?: number; digits?: number; window?: number }
) => {
  const normalized = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;

  const window = options?.window ?? 1;
  const interval = options?.interval ?? 30;
  const now = Date.now();

  for (let offset = -window; offset <= window; offset += 1) {
    const timestamp = now + offset * interval * 1000;
    const expected = await generateTotpCode(secret, { ...options, timestamp });
    if (expected === normalized) return true;
  }

  return false;
};

export const getTotpRemainingSeconds = (interval = 30) => {
  const elapsed = Math.floor(Date.now() / 1000) % interval;
  return interval - elapsed;
};

export const isTotpSupported = () => Platform.OS === 'web' || typeof globalThis.crypto?.subtle !== 'undefined';
