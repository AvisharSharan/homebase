import { HomebaseData } from "../types";

const now = new Date().toISOString();

export const blankData: HomebaseData = {
  version: 1,
  spaces: [
    { id: "daily", name: "Daily", createdAt: now, updatedAt: now },
  ],
  daily: {
    focus: "Learn how to use Homebase",
    quickNotes: "This is the daily panel! You can jot down quick brain dumps here, set a focus, and track your mood.",
    mood: "sharp",
  },
  cards: [
    {
      id: "welcome-note",
      spaceId: "daily",
      type: "note",
      title: "Welcome to Homebase 👋",
      content: "Homebase is your personal, local-first command center.\n\nEverything you type here stays in your browser. You can create different 'Spaces' in the sidebar to organize areas of your life, and inside those spaces, you can add Cards.\n\nThis is a Note card, but you can also create Tasks, Links, Snippets, and References. Try editing this card or pinning it using the buttons in the top right!",
      tags: ["welcome", "tutorial"],
      pinned: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tutorial-tasks",
      spaceId: "daily",
      type: "task",
      title: "Give it a try",
      content: "",
      tasks: [
        { id: "t1", text: "Create a new Space in the sidebar", completed: false },
        { id: "t2", text: "Check off this item", completed: false },
        { id: "t3", text: "Click 'New card' to add a code snippet", completed: false },
        { id: "t4", text: "Export a JSON backup using the top bar icon", completed: false },
      ],
      tags: ["getting-started"],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    }
  ],
  hasSeenWelcome: false,
  updatedAt: now,
};
