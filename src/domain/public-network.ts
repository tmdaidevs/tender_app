import { isIP } from "node:net";

export function isPrivateAddress(address: string) {
  if (!isIP(address)) return true;
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) {
    return isPrivateAddress(normalized.slice("::ffff:".length));
  }
  if (
    normalized === "::" || normalized === "::1" || normalized.startsWith("fc")
    || normalized.startsWith("fd") || normalized.startsWith("fe8")
    || normalized.startsWith("fe9") || normalized.startsWith("fea")
    || normalized.startsWith("feb") || normalized.startsWith("ff")
  ) return true;
  if (normalized.includes(":")) return false;
  const [a, b] = normalized.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254)
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}
