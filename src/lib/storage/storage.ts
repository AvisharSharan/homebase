import { blankData } from "../../data/sampleData";
import { defaultSettings } from "../../data/defaults";
import { CardType, HomebaseCard, HomebaseData, SettingsData, Space } from "../../types";

export const STORAGE_KEY = "homebase:data:v2";
export const RECOVERY_KEY = "homebase:recovery:v2";
let recoveryData: string | null = null;
let storageWarning = "";
let lastStoredRaw: string | null = null;
export const getStorageWarning = () => storageWarning;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 200;
}
function isDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function uniqueIds(items: { id: string }[]) {
  return new Set(items.map(item => item.id)).size === items.length;
}
const cardTypes: CardType[] = ["note", "task", "link", "reference", "snippet"];
function isSpace(value: unknown): value is Space {
  return isRecord(value) && isId(value.id) && typeof value.name === "string" &&
    !!value.name.trim() && isDate(value.createdAt) && isDate(value.updatedAt);
}
export function isHomebaseCard(value: unknown): value is HomebaseCard {
  if (!isRecord(value) || !isId(value.id) || !isId(value.spaceId) ||
    typeof value.title !== "string" || typeof value.content !== "string" ||
    !isDate(value.createdAt) || !isDate(value.updatedAt) || typeof value.pinned !== "boolean" ||
    !Array.isArray(value.tags) || !value.tags.every(tag => typeof tag === "string") ||
    !cardTypes.includes(value.type as CardType)) return false;
  if (value.type === "task") {
    return Array.isArray(value.tasks) && value.tasks.every(task => isRecord(task) &&
      isId(task.id) && typeof task.text === "string" && typeof task.completed === "boolean") &&
      uniqueIds(value.tasks);
  }
  if (value.type === "link") return typeof value.url === "string";
  if (value.type === "reference") return typeof value.reference === "string";
  if (value.type === "snippet") return typeof value.language === "string";
  return true;
}
export function validateHomebaseData(value: unknown): value is HomebaseData {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.spaces) ||
    !value.spaces.length || !value.spaces.every(isSpace) || !uniqueIds(value.spaces) ||
    !Array.isArray(value.cards) || !value.cards.every(isHomebaseCard) || !uniqueIds(value.cards) ||
    !isRecord(value.daily) || typeof value.daily.focus !== "string" ||
    typeof value.daily.quickNotes !== "string" || typeof value.daily.mood !== "string" ||
    !isDate(value.updatedAt) || (value.hasSeenWelcome !== undefined && typeof value.hasSeenWelcome !== "boolean")) return false;
  const spaces = new Set(value.spaces.map(space => space.id));
  return value.cards.every(card => spaces.has(card.spaceId));
}
function enumValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback;
}
export function normalizeSettings(value: unknown): SettingsData {
  const settings = isRecord(value) ? value : {};
  const section = (name: string) => isRecord(settings[name]) ? settings[name] : {};
  const appearance = section("appearance"), profile = section("profile"), cards = section("cards"), daily = section("daily");
  return {
    appearance: { theme: enumValue(appearance.theme, ["midnight", "snow"], defaultSettings.appearance.theme) },
    profile: {
      displayName: typeof profile.displayName === "string" ? profile.displayName : "",
      avatar: typeof profile.avatar === "string" ? profile.avatar : defaultSettings.profile.avatar,
    },
    cards: {
      defaultType: enumValue(cards.defaultType, cardTypes, "note"),
      density: enumValue(cards.density, ["comfortable", "compact"], "comfortable"),
      sortOrder: enumValue(cards.sortOrder, ["newest", "oldest", "alphabetical", "manual"], "newest"),
    },
    daily: {
      showJournal: typeof daily.showJournal === "boolean" ? daily.showJournal : true,
      showPinnedLinks: typeof daily.showPinnedLinks === "boolean" ? daily.showPinnedLinks : true,
      greetingText: typeof daily.greetingText === "string" ? daily.greetingText : "",
    },
  };
}
export function normalizeHomebaseData(parsed: HomebaseData): HomebaseData {
  const data = structuredClone(parsed);
  data.settings = normalizeSettings(parsed.settings);
  data.hasSeenWelcome = typeof parsed.hasSeenWelcome === "boolean" ? parsed.hasSeenWelcome : true;
  data.cards = data.cards.map(card => ({ ...card, tags: [...new Set(card.tags)] }));
  if (!data.spaces.some(space => space.id === "daily")) {
    data.spaces.unshift({ id: "daily", name: "Daily", createdAt: data.updatedAt, updatedAt: data.updatedAt });
  }
  return data;
}
export function loadHomebaseData(): HomebaseData {
  storageWarning = "";
  recoveryData = null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    lastStoredRaw = stored;
    if (!stored) return structuredClone(blankData);
    recoveryData = stored;
    const parsed: unknown = JSON.parse(stored);
    if (!validateHomebaseData(parsed)) throw new Error("Invalid saved data");
    recoveryData = null;
    return normalizeHomebaseData(parsed);
  } catch {
    storageWarning = recoveryData
      ? "Saved data could not be loaded. The original is preserved; export a recovery backup before resetting."
      : "Browser storage is unavailable. Changes are temporary; export a backup before closing.";
    return structuredClone(blankData);
  }
}
export function saveHomebaseData(data: HomebaseData) {
  if (window.localStorage.getItem(STORAGE_KEY) !== lastStoredRaw) {
    throw new Error("Saved data changed in another tab. Export your current work, then reload to use the other tab's data.");
  }
  // Preserve unreadable data before the first edit can overwrite it.
  if (recoveryData !== null) {
    window.localStorage.setItem(RECOVERY_KEY, recoveryData);
    recoveryData = null;
  }
  const raw = JSON.stringify(data);
  window.localStorage.setItem(STORAGE_KEY, raw);
  lastStoredRaw = raw;
}
export function readRecoveryData() {
  return recoveryData ?? window.localStorage.getItem(RECOVERY_KEY);
}
