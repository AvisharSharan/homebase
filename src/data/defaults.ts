import { SettingsData } from "../types";

export const defaultSettings: SettingsData = {
  appearance: {
    theme: "midnight",
  },
  profile: {
    displayName: "",
    avatar: "👤",
  },

  cards: {
    defaultType: "note",
    density: "comfortable",
    sortOrder: "newest",
  },
  daily: {
    showJournal: true,
    showPinnedLinks: true,
    greetingText: "",
  },
};
