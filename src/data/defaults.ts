import { SettingsData } from "../types";

export const defaultSettings: SettingsData = {
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
