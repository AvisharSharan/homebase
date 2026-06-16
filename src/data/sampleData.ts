import { HomebaseData } from "../types";

const now = new Date().toISOString();

export const blankData: HomebaseData = {
  version: 1,
  spaces: [
    { id: "daily", name: "Daily", createdAt: now, updatedAt: now },
  ],
  daily: {
    focus: "",
    quickNotes: "",
    mood: "",
  },
  cards: [],
  updatedAt: now,
};
