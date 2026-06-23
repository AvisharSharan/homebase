import { blankData } from "../../data/sampleData";
import { defaultSettings } from "../../data/defaults";
import { CardType, HomebaseCard, HomebaseData, Space } from "../../types";

const STORAGE_KEY = "homebase:data:v2";

const cardTypes: CardType[] = ["note", "task", "link", "reference", "snippet"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSpace(value: unknown): value is Space {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

export function isHomebaseCard(value: unknown): value is HomebaseCard {
  if (!isRecord(value)) return false;
  const type = value.type;
  const baseValid =
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.content === "string" &&
    typeof value.spaceId === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    typeof value.pinned === "boolean" &&
    isStringArray(value.tags) &&
    typeof type === "string" &&
    cardTypes.includes(type as CardType);

  if (!baseValid) return false;
  if (type === "task") {
    return (
      Array.isArray(value.tasks) &&
      value.tasks.every(
        (task) =>
          isRecord(task) &&
          typeof task.id === "string" &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean",
      )
    );
  }
  if (type === "link") return typeof value.url === "string";
  if (type === "reference") return typeof value.reference === "string";
  if (type === "snippet") return typeof value.language === "string";
  return true;
}

export function validateHomebaseData(value: unknown): value is HomebaseData {
  if (!isRecord(value)) return false;
  return (
    value.version === 1 &&
    Array.isArray(value.spaces) &&
    value.spaces.length > 0 &&
    value.spaces.every(isSpace) &&
    Array.isArray(value.cards) &&
    value.cards.every(isHomebaseCard) &&
    isRecord(value.daily) &&
    typeof value.daily.focus === "string" &&
    typeof value.daily.quickNotes === "string" &&
    typeof value.daily.mood === "string" &&
    typeof value.updatedAt === "string" &&
    (typeof value.hasSeenWelcome === "boolean" || typeof value.hasSeenWelcome === "undefined")
  );
}

export function normalizeHomebaseData(parsed: any): HomebaseData {
  if (typeof parsed.hasSeenWelcome !== "boolean") {
    parsed.hasSeenWelcome = true;
  }
  if (!parsed.settings || typeof parsed.settings !== "object") {
    parsed.settings = defaultSettings;
  } else {
    parsed.settings = {
      profile: { ...defaultSettings.profile, ...parsed.settings.profile },
      cards: { ...defaultSettings.cards, ...parsed.settings.cards },
      daily: { ...defaultSettings.daily, ...parsed.settings.daily },
    };
  }
  return parsed;
}

export function loadHomebaseData(): HomebaseData {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return blankData;

  try {
    const parsed = JSON.parse(stored);
    if (validateHomebaseData(parsed)) {
      return normalizeHomebaseData(parsed);
    }
    return blankData;
  } catch {
    return blankData;
  }

  return blankData;
}

export function saveHomebaseData(data: HomebaseData) {
  const nextData = { ...data, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
}
