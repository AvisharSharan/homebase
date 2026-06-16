export type CardType = "note" | "task" | "link" | "reference" | "snippet";

export interface Space {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface BaseCard {
  id: string;
  type: CardType;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  spaceId: string;
}

export interface NoteCard extends BaseCard {
  type: "note";
}

export interface TaskCard extends BaseCard {
  type: "task";
  tasks: TaskItem[];
}

export interface LinkCard extends BaseCard {
  type: "link";
  url: string;
}

export interface ReferenceCard extends BaseCard {
  type: "reference";
  reference: string;
}

export interface SnippetCard extends BaseCard {
  type: "snippet";
  language: string;
}

export type HomebaseCard = NoteCard | TaskCard | LinkCard | ReferenceCard | SnippetCard;

export interface DailyState {
  focus: string;
  quickNotes: string;
  mood: string;
}

export interface HomebaseData {
  version: number;
  spaces: Space[];
  cards: HomebaseCard[];
  daily: DailyState;
  hasSeenWelcome: boolean;
  updatedAt: string;
}
