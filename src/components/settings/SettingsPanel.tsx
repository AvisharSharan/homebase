import { useState } from "react";
import {
  User,
  Palette,
  LayoutGrid,
  Calendar,
  HardDrive,
  Keyboard,
  Upload,
  Download,
  RotateCcw,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import {
  SettingsData,
  CardType,
  CardDensity,
  SortOrder,
} from "../../types";
import { cn } from "@/lib/utils";

interface SettingsProps {
  open: boolean;
  settings: SettingsData;
  onClose: () => void;
  onChange: (settings: SettingsData) => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  storageInfo: { used: number; cardCount: number; spaceCount: number };
}

type SectionId =
  | "profile"
  | "cards"
  | "daily"
  | "data"
  | "shortcuts";

const NAV_ITEMS: { id: SectionId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "cards", label: "Cards & Layout", icon: LayoutGrid },
  { id: "daily", label: "Daily", icon: Calendar },
  { id: "data", label: "Data", icon: HardDrive },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
];

const AVATARS = ["👤", "🚀", "⚡", "🎯", "💻", "🌙", "🔥", "✨"];


const CARD_TYPES: { id: CardType; label: string }[] = [
  { id: "note", label: "Note" },
  { id: "task", label: "Task" },
  { id: "link", label: "Link" },
  { id: "reference", label: "Reference" },
  { id: "snippet", label: "Snippet" },
];

const DENSITY_OPTIONS: { id: CardDensity; label: string; desc: string }[] = [
  { id: "comfortable", label: "Comfortable", desc: "More spacing" },
  { id: "compact", label: "Compact", desc: "Tighter grid" },
];

const SORT_OPTIONS: { id: SortOrder; label: string }[] = [
  { id: "manual", label: "Manual (drag to reorder)" },
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "alphabetical", label: "Alphabetical" },
];

const SHORTCUTS = [
  { keys: "Ctrl+K / ⌘K", action: "Search" },
  { keys: "Esc", action: "Close dialogs" },
  { keys: "Ctrl+E / ⌘E", action: "Toggle editor" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SettingsPanel({
  open,
  settings,
  onClose,
  onChange,
  onExport,
  onImport,
  onReset,
  storageInfo,
}: SettingsProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");

  const update = <K extends keyof SettingsData>(
    section: K,
    patch: Partial<SettingsData[K]>,
  ) => {
    onChange({ ...settings, [section]: { ...settings[section], ...patch } });
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-2xl border-white/[0.07] bg-ink-950 text-bone-500"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Manage your Homebase preferences</SheetDescription>
        </SheetHeader>

        <div className="flex h-full flex-col sm:flex-row">
          {/* Mobile nav — horizontal icon tabs */}
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.07] bg-ink-900 px-3 py-2 sm:hidden">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                aria-label={label}
                aria-current={activeSection === id ? "page" : undefined}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
                  activeSection === id
                    ? "bg-white/10 text-bone-500"
                    : "text-stone-600 hover:bg-white/[0.04] hover:text-bone-400",
                )}
              >
                <Icon size={16} />
              </button>
            ))}
          </nav>

          {/* Desktop nav — vertical sidebar */}
          <nav className="hidden w-48 shrink-0 flex-col gap-0.5 border-r border-white/[0.07] bg-ink-900 px-3 py-6 sm:flex">
            <p className="mb-4 px-3 text-sm font-semibold text-bone-500">Settings</p>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all duration-150",
                  activeSection === id
                    ? "bg-white/[0.08] text-bone-500"
                    : "text-stone-500 hover:bg-white/[0.04] hover:text-bone-400",
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
            <div key={activeSection} className="settings-section-enter">
              {activeSection === "profile" && (
                <ProfileSection settings={settings} update={update} />
              )}
              {activeSection === "cards" && (
                <CardsSection settings={settings} update={update} />
              )}
              {activeSection === "daily" && (
                <DailySection settings={settings} update={update} />
              )}
              {activeSection === "data" && (
                <DataSection
                  storageInfo={storageInfo}
                  onExport={onExport}
                  onImport={onImport}
                  onReset={onReset}
                />
              )}
              {activeSection === "shortcuts" && <ShortcutsSection />}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
      {children}
    </p>
  );
}

type UpdateFn = <K extends keyof SettingsData>(
  section: K,
  patch: Partial<SettingsData[K]>,
) => void;

function ProfileSection({
  settings,
  update,
}: {
  settings: SettingsData;
  update: UpdateFn;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bone-500">Profile</h2>
        <p className="mt-1 text-sm text-stone-500">Personalize your workspace</p>
      </div>

      <Separator className="bg-white/[0.07]" />

      <div className="space-y-2">
        <SectionLabel>Display Name</SectionLabel>
        <Input
          aria-label="Display name"
          value={settings.profile.displayName}
          onChange={(e) => update("profile", { displayName: e.target.value })}
          placeholder="Your name"
          className="border-white/[0.07] bg-ink-850 text-bone-500 focus-visible:border-white/20 focus-visible:bg-ink-800"
        />
      </div>

      <div className="space-y-2">
        <SectionLabel>Avatar</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((emoji) => (
            <button
              key={emoji}
              aria-label={`Avatar ${emoji}`}
              aria-pressed={settings.profile.avatar === emoji}
              onClick={() => update("profile", { avatar: emoji })}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all duration-150",
                settings.profile.avatar === emoji
                  ? "bg-white/15 ring-2 ring-white/30"
                  : "bg-ink-850 hover:bg-white/[0.08]",
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}


function CardsSection({
  settings,
  update,
}: {
  settings: SettingsData;
  update: UpdateFn;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bone-500">Cards & Layout</h2>
        <p className="mt-1 text-sm text-stone-500">Configure card defaults and layout</p>
      </div>

      <Separator className="bg-white/[0.07]" />

      <div className="space-y-3">
        <SectionLabel>Default Card Type</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {CARD_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => update("cards", { defaultType: type.id })}
              className={cn(
                "rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                settings.cards.defaultType === type.id
                  ? "border-white/40 bg-white text-black"
                  : "border-white/[0.07] bg-ink-850 text-stone-500 hover:border-white/14 hover:text-bone-400",
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Card Density</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {DENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update("cards", { density: opt.id })}
              className={cn(
                "rounded-xl border px-4 py-3.5 text-left transition-all duration-150",
                settings.cards.density === opt.id
                  ? "border-white/30 bg-white/[0.06]"
                  : "border-white/[0.07] bg-ink-850 hover:border-white/14",
              )}
            >
              <p className="text-[13px] font-medium text-bone-500">{opt.label}</p>
              <p className="mt-0.5 text-[11px] text-stone-600">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Sort Order</SectionLabel>
        <div className="grid gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update("cards", { sortOrder: opt.id })}
              className={cn(
                "rounded-lg border px-4 py-2.5 text-left text-[13px] font-medium transition-all duration-150",
                settings.cards.sortOrder === opt.id
                  ? "border-white/30 bg-white/[0.06] text-bone-500"
                  : "border-white/[0.07] bg-ink-850 text-stone-500 hover:border-white/14 hover:text-bone-400",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DailySection({
  settings,
  update,
}: {
  settings: SettingsData;
  update: UpdateFn;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bone-500">Daily</h2>
        <p className="mt-1 text-sm text-stone-500">Configure your daily panel</p>
      </div>

      <Separator className="bg-white/[0.07]" />

      <div className="space-y-2">
        <SectionLabel>Greeting</SectionLabel>
        <Input aria-label="Daily greeting" value={settings.daily.greetingText}
          onChange={event => update("daily", { greetingText: event.target.value })}
          placeholder="Leave blank for a rotating greeting" />
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/[0.07] bg-ink-850 px-4 py-3 transition hover:border-white/14">
        <div>
          <p className="text-[13px] font-medium text-bone-500">Show journal section</p>
          <p className="mt-0.5 text-[11px] text-stone-600">Quick notes area</p>
        </div>
        <Checkbox
          aria-label="Show journal section"
          checked={settings.daily.showJournal}
          onCheckedChange={(checked) =>
            update("daily", { showJournal: checked === true })
          }
          className="border-white/15 data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=checked]:border-white/50"
        />
      </label>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/[0.07] bg-ink-850 px-4 py-3 transition hover:border-white/14">
        <div>
          <p className="text-[13px] font-medium text-bone-500">Show pinned links</p>
          <p className="mt-0.5 text-[11px] text-stone-600">
            Display pinned link cards on daily view
          </p>
        </div>
        <Checkbox
          aria-label="Show pinned links"
          checked={settings.daily.showPinnedLinks}
          onCheckedChange={(checked) =>
            update("daily", { showPinnedLinks: checked === true })
          }
          className="border-white/15 data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=checked]:border-white/50"
        />
      </label>

    </div>
  );
}

function DataSection({
  storageInfo,
  onExport,
  onImport,
  onReset,
}: {
  storageInfo: SettingsProps["storageInfo"];
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bone-500">Data</h2>
        <p className="mt-1 text-sm text-stone-500">Manage your data and backups</p>
      </div>

      <Separator className="bg-white/[0.07]" />

      <div className="space-y-3">
        <SectionLabel>Backup</SectionLabel>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onExport}
            variant="outline"
            className="gap-2 border-white/[0.07] bg-ink-850 text-bone-400 hover:border-white/14 hover:bg-ink-800 hover:text-bone-500"
          >
            <Upload size={14} />
            Export Backup
          </Button>
          <Button
            onClick={onImport}
            variant="outline"
            className="gap-2 border-white/[0.07] bg-ink-850 text-bone-400 hover:border-white/14 hover:bg-ink-800 hover:text-bone-500"
          >
            <Download size={14} />
            Import Backup
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Storage</SectionLabel>
        <div className="rounded-xl border border-white/[0.07] bg-ink-850 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-bone-500">
              {formatBytes(storageInfo.used)}
            </p>
            <p className="text-[11px] text-stone-600">used</p>
          </div>
          <Separator className="my-3 bg-white/[0.07]" />
          <div className="flex gap-6 text-xs">
            <div>
              <p className="text-bone-400">{storageInfo.cardCount}</p>
              <p className="text-stone-600">cards</p>
            </div>
            <div>
              <p className="text-bone-400">{storageInfo.spaceCount}</p>
              <p className="text-stone-600">spaces</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Danger Zone</SectionLabel>
        <Button
          onClick={onReset}
          variant="destructive"
          className="gap-2"
        >
          <RotateCcw size={14} />
          Reset App
        </Button>
        <p className="text-[11px] text-stone-600">
          This will clear all data and restore defaults.
        </p>
      </div>
    </div>
  );
}

function ShortcutsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bone-500">Shortcuts</h2>
        <p className="mt-1 text-sm text-stone-500">Keyboard shortcuts reference</p>
      </div>

      <Separator className="bg-white/[0.07]" />

      <div className="space-y-1.5">
        {SHORTCUTS.map((shortcut) => (
          <div
            key={shortcut.keys}
            className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-ink-850 px-4 py-3"
          >
            <span className="text-sm text-bone-400">{shortcut.action}</span>
            <kbd className="rounded-md border border-white/[0.1] bg-ink-900 px-2.5 py-1 text-xs font-medium text-bone-500">
              {shortcut.keys}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
