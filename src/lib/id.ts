export function createId(prefix = "item") {
  if (typeof globalThis.crypto?.randomUUID === "function") return `${prefix}-${crypto.randomUUID()}`;
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${randomPart}`;
}
