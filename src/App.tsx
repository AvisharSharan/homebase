import { ChangeEvent, lazy, Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Filter, Menu, Plus, X } from "lucide-react";
import { CardGrid } from "./components/cards/CardGrid";
import { DailyPanel } from "./components/daily/DailyPanel";
import { GlobalSearch } from "./components/search/GlobalSearch";
import { Sidebar } from "./components/spaces/Sidebar";
import { Button } from "./components/ui/button";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import { PromptDialog } from "./components/ui/PromptDialog";
import { WelcomeModal } from "./components/ui/WelcomeModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { downloadBackup, downloadText, readBackupFile } from "./lib/export/backup";
import { createId } from "./lib/id";
import { getStorageWarning, loadHomebaseData, readRecoveryData, saveHomebaseData } from "./lib/storage/storage";
import { CardType, HomebaseCard, HomebaseData, SettingsData, Space } from "./types";
import { blankData } from "./data/sampleData";
import { reorderCards } from "./lib/cards";
import { DragEndEvent } from "@dnd-kit/core";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./components/ui/sheet";

const CardEditor = lazy(() => import("./components/cards/CardEditor").then(m => ({ default: m.CardEditor })));
const SettingsPanel = lazy(() => import("./components/settings/SettingsPanel").then(m => ({ default: m.SettingsPanel })));
const CommandPalette = lazy(() => import("./components/search/CommandPalette").then(m => ({ default: m.CommandPalette })));

const allTypes: Array<CardType | "all"> = ["all", "note", "task", "link", "reference", "snippet"];

type PendingDelete =
  | { kind: "card"; card: HomebaseCard }
  | { kind: "space"; space: Space }
  | null;

type PromptState = 
  | { type: "create" }
  | { type: "rename"; spaceId: string; defaultValue: string }
  | null;

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function cardMatches(card: HomebaseCard, spaceName: string, query: string) {
  if (!query) return true;
  const fields = [
    spaceName,
    card.title,
    card.content,
    card.tags.join(" "),
    card.type === "link" ? card.url : "",
    card.type === "reference" ? card.reference : "",
    card.type === "snippet" ? card.language : "",
    card.type === "task" ? card.tasks.map((task) => task.text).join(" ") : "",
  ];
  return fields.some((field) => normalize(field).includes(query));
}

function sortCards(cards: HomebaseCard[], sortOrder: string = "newest") {
  if (sortOrder === "manual") {
    return [...cards].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return 0; // keep original array order for unpinned/pinned groups
    });
  }
  return [...cards].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (sortOrder === "alphabetical") return a.title.localeCompare(b.title);
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return sortOrder === "oldest" ? timeA - timeB : timeB - timeA;
  });
}

export default function App() {
  const [data, setData] = useState<HomebaseData>(() => loadHomebaseData());
  const [selectedSpaceId, setSelectedSpaceId] = useState(data.spaces[0]?.id ?? "daily");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CardType | "all">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [createType, setCreateType] = useState<CardType | undefined>();
  const [editingCard, setEditingCard] = useState<HomebaseCard | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [promptState, setPromptState] = useState<PromptState>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState(getStorageWarning);
  const [saveError, setSaveError] = useState("");
  const [pendingImport, setPendingImport] = useState<HomebaseData | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(!data.hasSeenWelcome);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedDataRef = useRef(data);

  useEffect(() => {
    if (data === savedDataRef.current) return;
    const save = () => {
      if (data === savedDataRef.current) return;
      try {
        saveHomebaseData(data);
        savedDataRef.current = data;
        setSaveError("");
      } catch (error) {
        setSaveError(error instanceof Error && error.message.includes("another tab")
          ? error.message : "Changes could not be saved to browser storage. Export a backup before closing.");
      }
    };
    const timeout = window.setTimeout(save, 300);
    window.addEventListener("pagehide", save);
    const onVisibility = () => { if (document.visibilityState === "hidden") save(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [data]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (welcomeOpen || settingsOpen || promptState || pendingDelete || pendingImport || confirmResetOpen) return;
      // Ctrl/Cmd + K: Toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        if (editorOpen) return;
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      
      // Ctrl/Cmd + E: Toggle editor
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        if (commandPaletteOpen) return;
        e.preventDefault();
        if (!editorOpen) { setEditingCard(null); setCreateType(undefined); }
        setEditorOpen(!editorOpen);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [welcomeOpen, settingsOpen, promptState, pendingDelete, pendingImport, confirmResetOpen, editorOpen, commandPaletteOpen]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", data.settings.appearance.theme);
    // NOTE: hardcoded to "white" — this means the accent color CSS variants
    // defined in styles.css (data-accent="blue"/"violet"/"rose"/"amber"/
    // "emerald"/"cyan") are currently unreachable dead code, and any accent
    // picker UI in Settings has no visible effect. If `appearance` has an
    // accent field, wire it in here, e.g.:
    //   document.documentElement.setAttribute("data-accent", data.settings.appearance.accent ?? "white");
    document.documentElement.setAttribute("data-accent", "white");
  }, [data.settings.appearance.theme]);

  const selectedSpace = data.spaces.find((space) => space.id === selectedSpaceId) ?? data.spaces[0];

  useEffect(() => {
    if (!data.spaces.some((space) => space.id === selectedSpaceId) && data.spaces[0]) {
      setSelectedSpaceId(data.spaces[0].id);
    }
  }, [data.spaces, selectedSpaceId]);

  const cardCounts = useMemo(() => {
    return data.cards.reduce<Record<string, number>>((counts, card) => {
      counts[card.spaceId] = (counts[card.spaceId] ?? 0) + 1;
      return counts;
    }, Object.create(null) as Record<string, number>);
  }, [data.cards]);

  const searchQuery = useDeferredValue(normalize(query));
  const isSearching = !!searchQuery;
  const spacesById = useMemo(() => new Map(data.spaces.map(space => [space.id, space.name])), [data.spaces]);
  const filteredCards = useMemo(() => {
    return sortCards(
      data.cards.filter((card) => {
        const inCurrentSpace = isSearching ? true : card.spaceId === selectedSpace?.id;
        const matchesType = typeFilter === "all" || card.type === typeFilter;
        return inCurrentSpace && matchesType && cardMatches(card, spacesById.get(card.spaceId) ?? "", searchQuery);
      }),
      data.settings.cards.sortOrder,
    );
  }, [data.cards, spacesById, data.settings.cards.sortOrder, isSearching, searchQuery, selectedSpace?.id, typeFilter]);

  const resultCount = isSearching
    ? filteredCards.length +
      data.spaces.filter((space) => normalize(space.name).includes(searchQuery)).length
    : 0;

  const dailyTaskCards = useMemo(() => data.cards.filter((card) => card.spaceId === "daily" && card.type === "task"), [data.cards]);
  const pinnedLinks = useMemo(() => data.cards.filter((card) => card.type === "link" && card.pinned), [data.cards]);

  function mutate(updater: (current: HomebaseData) => HomebaseData) {
    setData((current) => ({ ...updater(current), updatedAt: new Date().toISOString() }));
  }

  function toggleTheme() {
    // Snow is currently the only light theme; isLightMode below mirrors this.
    // If a light theme is ever added besides "snow", both this set and the
    // isLightMode check further down need to be updated together.
    const lightThemes = new Set(["snow"]);
    mutate((current) => {
      const currentTheme = current.settings.appearance.theme;
      const nextTheme = lightThemes.has(currentTheme) ? "midnight" : "snow";
      return {
        ...current,
        settings: {
          ...current.settings,
          appearance: {
            ...current.settings.appearance,
            theme: nextTheme,
          },
        },
      };
    });
  }

  function dismissWelcome(open: boolean, skip = false) {
    setWelcomeOpen(open);
    if (!open && !data.hasSeenWelcome) {
      mutate((current) => {
        let nextCards = current.cards;
        if (skip) {
          nextCards = nextCards.filter(c => c.id !== "welcome-note" && c.id !== "tutorial-tasks");
        }
        return { ...current, hasSeenWelcome: true, cards: nextCards };
      });
    }
  }

  function openCreateCard() {
    setCreateType(undefined);
    setEditingCard(null);
    setEditorOpen(true);
  }

  function saveCard(card: HomebaseCard) {
    mutate((current) => {
      const exists = current.cards.some((item) => item.id === card.id);
      return {
        ...current,
        cards: exists ? current.cards.map((item) => (item.id === card.id ? card : item)) : [card, ...current.cards],
      };
    });
    setEditorOpen(false);
  }

  function createSpace() {
    setPromptState({ type: "create" });
  }

  function renameSpace(spaceId: string) {
    const space = data.spaces.find((item) => item.id === spaceId);
    if (!space) return;
    setPromptState({ type: "rename", spaceId, defaultValue: space.name });
  }

  function handlePromptConfirm(value: string) {
    if (promptState?.type === "create") {
      const timestamp = new Date().toISOString();
      const space: Space = { id: createId("space"), name: value, createdAt: timestamp, updatedAt: timestamp };
      mutate((current) => ({ ...current, spaces: [...current.spaces, space] }));
      setSelectedSpaceId(space.id);
    } else if (promptState?.type === "rename") {
      const spaceId = promptState.spaceId;
      mutate((current) => ({
        ...current,
        spaces: current.spaces.map((item) =>
          item.id === spaceId ? { ...item, name: value, updatedAt: new Date().toISOString() } : item,
        ),
      }));
    }
    setPromptState(null);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "card") {
      mutate((current) => ({ ...current, cards: current.cards.filter((card) => card.id !== pendingDelete.card.id) }));
    } else {
      if (pendingDelete.space.id === "daily") return;
      mutate((current) => ({
        ...current,
        spaces: current.spaces.filter((space) => space.id !== pendingDelete.space.id),
        cards: current.cards.filter((card) => card.spaceId !== pendingDelete.space.id),
      }));
    }
    setPendingDelete(null);
  }

  function togglePin(cardId: string) {
    mutate((current) => ({
      ...current,
      cards: current.cards.map((card) =>
        card.id === cardId ? { ...card, pinned: !card.pinned, updatedAt: new Date().toISOString() } : card,
      ),
    }));
  }

  function toggleTask(cardId: string, taskId: string) {
    mutate((current) => ({
      ...current,
      cards: current.cards.map((card) =>
        card.id === cardId && card.type === "task"
          ? {
              ...card,
              updatedAt: new Date().toISOString(),
              tasks: card.tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
            }
          : card,
      ),
    }));
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = await readBackupFile(file);
      setSettingsOpen(false);
      setPendingImport(imported);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not import backup.");
    }
  }

  function resetApp() {
    setData(structuredClone(blankData));
    setSelectedSpaceId("daily");
    setConfirmResetOpen(false);
    setWelcomeOpen(true);
    setQuery("");
    setTypeFilter("all");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      mutate((current) => {
        const reordered = reorderCards(current.cards, filteredCards.map(card => card.id), String(active.id), String(over.id));
        if (reordered === current.cards) return current;
        
        return {
          ...current,
          cards: reordered,
          settings: {
            ...current.settings,
            cards: {
              ...current.settings.cards,
              sortOrder: "manual",
            }
          }
        };
      });
    }
  }

  const deleteTitle = pendingDelete?.kind === "space" ? "Delete space?" : "Delete card?";
  const deleteDescription =
    pendingDelete?.kind === "space"
      ? `This will remove "${pendingDelete.space.name}" and all cards inside it.`
      : pendingDelete?.kind === "card"
        ? `This will permanently remove "${pendingDelete.card.title}".`
        : "";

  const storageInfo = useMemo(() => {
    const raw = JSON.stringify(data);
    return {
      used: new Blob([raw]).size,
      cardCount: data.cards.length,
      spaceCount: data.spaces.length,
    };
  }, [settingsOpen, data]);

  function selectSpace(id: string) {
    setSelectedSpaceId(id);
    setQuery("");
    setTypeFilter("all");
  }

  function exportRecovery() {
    try {
      const raw = readRecoveryData();
      if (raw) downloadText(raw, "homebase-recovery.json");
      else setNotice("No recovery backup is available.");
    } catch { setNotice("Browser storage is unavailable."); }
  }

  function updateSettings(next: SettingsData) {
    mutate((current) => ({ ...current, settings: next }));
  }

  const isLightMode = data.settings.appearance.theme === "snow"; // keep in sync with `lightThemes` in toggleTheme
  const moodMap: Record<string, { dark: string; light: string }> = {
    sharp: { dark: "from-cyan-500/30 via-blue-500/30 to-indigo-500/30", light: "from-cyan-400/40 via-blue-400/40 to-indigo-400/40" },
    steady: { dark: "from-emerald-500/30 via-teal-500/30 to-cyan-500/30", light: "from-emerald-400/40 via-teal-400/40 to-cyan-400/40" },
    calm: { dark: "from-violet-500/30 via-purple-500/30 to-fuchsia-500/30", light: "from-violet-400/40 via-purple-400/40 to-fuchsia-400/40" },
    tired: { dark: "from-stone-500/30 via-slate-500/30 to-zinc-500/30", light: "from-stone-400/40 via-slate-400/40 to-zinc-400/40" },
    restless: { dark: "from-rose-500/30 via-orange-500/30 to-amber-500/30", light: "from-rose-400/40 via-orange-400/40 to-amber-400/40" },
  };
  const activeGradient = moodMap[data.daily.mood]?.[isLightMode ? "light" : "dark"] || moodMap["calm"][isLightMode ? "light" : "dark"];

  return (
    <div
      className="flex h-dvh overflow-hidden bg-ink-950 text-bone-500 transition-colors"
      data-theme={data.settings.appearance.theme}
    >
      {/* Boot sequence pulsing gradient blob tied to mood */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center animate-boot-pulse-css overflow-visible">
        <div className={`absolute -top-[125px] h-[200px] w-[1200px] rounded-[100%] bg-gradient-to-r ${activeGradient} blur-[80px] mix-blend-screen`} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          spaces={data.spaces}
          selectedSpaceId={selectedSpace?.id ?? ""}
          cardCounts={cardCounts}
          settings={data.settings}
          onSelectSpace={selectSpace}
          onCreateSpace={createSpace}
          onRenameSpace={renameSpace}
          onDeleteSpace={(spaceId) => {
            const space = data.spaces.find((item) => item.id === spaceId);
            if (space && space.id !== "daily") setPendingDelete({ kind: "space", space });
          }}
          onExport={() => downloadBackup(data)}
          onImport={() => fileInputRef.current?.click()}
          onReset={() => setConfirmResetOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleTheme={toggleTheme}
        />
      </div>

      {/* Mobile sidebar overlay */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 max-w-[88vw] p-0">
            <SheetTitle className="sr-only">Spaces</SheetTitle>
            <SheetDescription className="sr-only">Choose and manage your spaces.</SheetDescription>
            <Sidebar
              spaces={data.spaces}
              selectedSpaceId={selectedSpace?.id ?? ""}
              cardCounts={cardCounts}
              settings={data.settings}
              onSelectSpace={(spaceId) => {
                selectSpace(spaceId);
                setMobileSidebarOpen(false);
              }}
              onCreateSpace={() => { setMobileSidebarOpen(false); createSpace(); }}
              onRenameSpace={(id) => { setMobileSidebarOpen(false); renameSpace(id); }}
              onDeleteSpace={(spaceId) => {
                const space = data.spaces.find((item) => item.id === spaceId);
                if (space && space.id !== "daily") { setMobileSidebarOpen(false); setPendingDelete({ kind: "space", space }); }
              }}
              onExport={() => downloadBackup(data)}
              onImport={() => fileInputRef.current?.click()}
              onReset={() => setConfirmResetOpen(true)}
              onOpenSettings={() => {
                setSettingsOpen(true);
                setMobileSidebarOpen(false);
              }}
              onToggleTheme={toggleTheme}
            />
          </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col">
        <TooltipProvider delayDuration={200}>
          {/* Header */}
          <header className="border-b border-white/[0.06] px-4 py-3 backdrop-blur" style={{ backgroundColor: "color-mix(in srgb, var(--hb-ink-950) 80%, transparent)" }}>
            <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3">
              {/* Mobile menu toggle */}
              <Button
                className="size-9 shrink-0 px-0 md:hidden"
                aria-label="Open spaces"
                variant="ghost"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu size={16} />
              </Button>

              {/* Space label */}
              <div className="hidden min-w-[140px] sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
                  {isSearching ? "Global results" : "Space"}
                </p>
                <h2 className="truncate text-sm font-semibold text-bone-500 leading-tight mt-0.5">
                  {isSearching ? "Search" : selectedSpace?.name}
                </h2>
              </div>

              {/* Search */}
              <GlobalSearch value={query} onChange={setQuery} resultCount={resultCount} />

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1.5">
                <Button aria-label="New card" onClick={openCreateCard} className="gap-1.5 bg-accent text-accent-text hover:opacity-90 shadow-inner-bright px-3 sm:px-4 transition-opacity">
                  <Plus size={16} />
                  <span className="hidden sm:inline">New card</span>
                </Button>
                
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={importBackup} />
              </div>
            </div>
          </header>
        </TooltipProvider>

        {/* Content area */}
        <section className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
          <div className="mx-auto w-full max-w-[1400px]">
            {saveError && <div role="alert" className="mb-4 rounded-lg border border-red-400 p-3 text-sm">
              {saveError} <Button variant="outline" onClick={() => downloadBackup(data)}>Export backup</Button>
            </div>}
            {/* Notice banner */}
            {notice ? (
              <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-ink-850 px-3.5 py-2.5 text-sm text-bone-400 animate-slide-up">
                <span>{notice}</span>
                {notice.includes("original is preserved") && <Button variant="outline" onClick={exportRecovery}>Export recovery backup</Button>}
                <button
                  aria-label="Dismiss notice"
                  onClick={() => setNotice("")}
                  className="text-stone-600 hover:text-bone-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}

            {/* Daily panel */}
            {selectedSpace?.id === "daily" && !isSearching ? (
              <DailyPanel
                daily={data.daily}
                dailyTasks={dailyTaskCards}
                pinnedLinks={pinnedLinks}
                settings={data.settings}
                onDailyChange={(daily) => mutate((current) => ({ ...current, daily }))}
                onToggleTask={toggleTask}
              />
            ) : null}

            {/* Card toolbar */}
            <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] text-stone-600">
                <span className="font-semibold text-bone-400">{filteredCards.length}</span>{" "}
                {filteredCards.length === 1 ? "card" : "cards"}
                {isSearching ? " across Homebase" : selectedSpace ? ` in ${selectedSpace.name}` : ""}
              </p>
              <label className="flex items-center gap-2 text-[12px] text-stone-600">
                <Filter size={14} />
                <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as CardType | "all")}>
                  <SelectTrigger aria-label="Filter card type" className="h-8 w-32 bg-ink-850 border-white/[0.07] text-[12px]">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-ink-850 border-white/[0.07]">
                    {allTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-[12px] focus:bg-ink-800 focus:text-white">
                        {type === "all" ? "All types" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>

            {isSearching && <div className="mb-4 flex flex-wrap gap-2">
              {data.spaces.filter(space => normalize(space.name).includes(searchQuery)).map(space =>
                <Button key={space.id} variant="outline" onClick={() => selectSpace(space.id)}>{space.name}</Button>
              )}
            </div>}
            {/* Cards */}
            <CardGrid
              cards={filteredCards}
              hasFilters={isSearching || typeFilter !== "all"}
              density={data.settings.cards.density}
              onCreateCard={openCreateCard}
              onEdit={(card) => {
                setEditingCard(card);
                setEditorOpen(true);
              }}
              onDelete={(card) => setPendingDelete({ kind: "card", card })}
              onTogglePin={togglePin}
              onToggleTask={toggleTask}
              onDragEnd={handleDragEnd}
            />
          </div>
        </section>
      </main>

      <Suspense fallback={<div role="status" className="fixed bottom-4 right-4 z-50 rounded bg-ink-850 p-3">Loading…</div>}>
      {editorOpen && <CardEditor
        open={editorOpen}
        spaceId={selectedSpace?.id ?? data.spaces[0]?.id ?? "daily"}
        card={editingCard}
        defaultType={createType ?? data.settings.cards.defaultType}
        onClose={() => setEditorOpen(false)}
        onSave={saveCard}
      />}
      </Suspense>

      <ConfirmDialog
        open={Boolean(pendingImport)}
        title="Replace data with backup?"
        description="This replaces all current spaces, cards, settings, and daily notes. Export a backup first if you want to keep them."
        confirmLabel="Import"
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          if (!pendingImport) return;
          setData(pendingImport);
          selectSpace(pendingImport.spaces[0].id);
          setWelcomeOpen(!pendingImport.hasSeenWelcome);
          setPendingImport(null);
          setNotice("Backup imported successfully.");
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={deleteTitle}
        description={deleteDescription}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset Homebase?"
        description="This will permanently delete all your spaces, cards, and data, resetting the app to a blank slate. Are you absolutely sure?"
        confirmLabel="Reset Everything"
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={resetApp}
      />

      <WelcomeModal
        open={welcomeOpen}
        onOpenChange={(open) => dismissWelcome(open, false)}
        onComplete={(skip) => dismissWelcome(false, skip)}
      />

      <PromptDialog
        open={Boolean(promptState)}
        title={promptState?.type === "create" ? "Name this space" : "Rename space"}
        defaultValue={promptState?.type === "rename" ? promptState.defaultValue : ""}
        confirmLabel={promptState?.type === "create" ? "Create" : "Save"}
        onConfirm={handlePromptConfirm}
        onCancel={() => setPromptState(null)}
      />

      <Suspense fallback={null}>
      {settingsOpen && <SettingsPanel
        open={settingsOpen}
        settings={data.settings}
        onClose={() => setSettingsOpen(false)}
        onChange={updateSettings}
        onExport={() => downloadBackup(data)}
        onImport={() => fileInputRef.current?.click()}
        onReset={() => {
          setSettingsOpen(false);
          setConfirmResetOpen(true);
        }}
        storageInfo={storageInfo}
      />}

      {commandPaletteOpen && <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        spaces={data.spaces}
        cards={data.cards}
        onSelectSpace={selectSpace}
        onCreateCard={(type) => {
          setCreateType(type);
          setEditingCard(null);
          setEditorOpen(true);
        }}
        onToggleTheme={toggleTheme}
        onSelectCard={(card) => {
          setSelectedSpaceId(card.spaceId);
          setEditingCard(card);
          setEditorOpen(true);
        }}
      />}
      </Suspense>
    </div>
  );
}
