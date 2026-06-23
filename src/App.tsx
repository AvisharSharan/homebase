import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Filter, Menu, Plus, X } from "lucide-react";
import { CardEditor } from "./components/cards/CardEditor";
import { CardGrid } from "./components/cards/CardGrid";
import { DailyPanel } from "./components/daily/DailyPanel";
import { GlobalSearch } from "./components/search/GlobalSearch";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { Sidebar } from "./components/spaces/Sidebar";
import { Button } from "./components/ui/button";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import { PromptDialog } from "./components/ui/PromptDialog";
import { WelcomeModal } from "./components/ui/WelcomeModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { downloadBackup, readBackupFile } from "./lib/export/backup";
import { createId } from "./lib/id";
import { loadHomebaseData, saveHomebaseData } from "./lib/storage/storage";
import { CardType, HomebaseCard, HomebaseData, SettingsData, Space } from "./types";
import { blankData } from "./data/sampleData";

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
  const [editingCard, setEditingCard] = useState<HomebaseCard | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [promptState, setPromptState] = useState<PromptState>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [welcomeOpen, setWelcomeOpen] = useState(!data.hasSeenWelcome);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveHomebaseData(data);
  }, [data]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search spaces, cards, tags..."]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // Ctrl/Cmd + E: Toggle editor
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setEditorOpen((prev) => {
          if (!prev) setEditingCard(null); // clear editing state when opening
          return !prev;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    }, {});
  }, [data.cards]);

  const searchQuery = normalize(query);
  const filteredCards = useMemo(() => {
    return sortCards(
      data.cards.filter((card) => {
        const space = data.spaces.find((item) => item.id === card.spaceId);
        const inCurrentSpace = query ? true : card.spaceId === selectedSpace?.id;
        const matchesType = typeFilter === "all" || card.type === typeFilter;
        return inCurrentSpace && matchesType && cardMatches(card, space?.name ?? "", searchQuery);
      }),
      data.settings.cards.sortOrder,
    );
  }, [data.cards, data.spaces, data.settings.cards.sortOrder, query, searchQuery, selectedSpace?.id, typeFilter]);

  const resultCount = query
    ? filteredCards.length +
      data.spaces.filter((space) => normalize(space.name).includes(searchQuery)).length
    : 0;

  const dailyTaskCards = data.cards.filter((card) => card.spaceId === "daily" && card.type === "task");
  const pinnedLinks = data.cards.filter((card) => card.type === "link" && card.pinned);

  function mutate(updater: (current: HomebaseData) => HomebaseData) {
    setData((current) => ({ ...updater(current), updatedAt: new Date().toISOString() }));
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
      const approved = window.confirm("Import this backup and replace all current Homebase data?");
      if (!approved) return;
      setData(imported);
      setSelectedSpaceId(imported.spaces[0]?.id ?? "daily");
      setNotice("Backup imported successfully.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not import backup.");
    }
  }

  function resetApp() {
    setData(blankData);
    setSelectedSpaceId("daily");
    setConfirmResetOpen(false);
    setWelcomeOpen(true);
  }

  const deleteTitle = pendingDelete?.kind === "space" ? "Delete space?" : "Delete card?";
  const deleteDescription =
    pendingDelete?.kind === "space"
      ? `This will remove "${pendingDelete.space.name}" and all cards inside it.`
      : pendingDelete?.kind === "card"
        ? `This will permanently remove "${pendingDelete.card.title}".`
        : "";

  const storageInfo = useMemo(() => {
    const raw = window.localStorage.getItem("homebase:data:v2") ?? "";
    return {
      used: new Blob([raw]).size,
      cardCount: data.cards.length,
      spaceCount: data.spaces.length,
    };
  }, [data.cards.length, data.spaces.length]);

  function updateSettings(next: SettingsData) {
    mutate((current) => ({ ...current, settings: next }));
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-ink-950 text-bone-500"
    >
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          spaces={data.spaces}
          selectedSpaceId={selectedSpace?.id ?? ""}
          cardCounts={cardCounts}
          settings={data.settings}
          onSelectSpace={setSelectedSpaceId}
          onCreateSpace={createSpace}
          onRenameSpace={renameSpace}
          onDeleteSpace={(spaceId) => {
            const space = data.spaces.find((item) => item.id === spaceId);
            if (space && data.spaces.length > 1) setPendingDelete({ kind: "space", space });
          }}
          onExport={() => downloadBackup(data)}
          onImport={() => fileInputRef.current?.click()}
          onReset={() => setConfirmResetOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="h-full w-72 max-w-[88vw] animate-slide-in" onClick={(event) => event.stopPropagation()}>
            <Sidebar
              spaces={data.spaces}
              selectedSpaceId={selectedSpace?.id ?? ""}
              cardCounts={cardCounts}
              settings={data.settings}
              onSelectSpace={(spaceId) => {
                setSelectedSpaceId(spaceId);
                setMobileSidebarOpen(false);
              }}
              onCreateSpace={createSpace}
              onRenameSpace={renameSpace}
              onDeleteSpace={(spaceId) => {
                const space = data.spaces.find((item) => item.id === spaceId);
                if (space && data.spaces.length > 1) setPendingDelete({ kind: "space", space });
              }}
              onExport={() => downloadBackup(data)}
              onImport={() => fileInputRef.current?.click()}
              onReset={() => setConfirmResetOpen(true)}
              onOpenSettings={() => {
                setSettingsOpen(true);
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col">
        <TooltipProvider delayDuration={200}>
          {/* Header */}
          <header className="border-b border-white/[0.06] px-4 py-3 backdrop-blur" style={{ backgroundColor: "color-mix(in srgb, var(--hb-ink-950) 80%, transparent)" }}>
            <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3">
              {/* Mobile menu toggle */}
              <Button
                className="size-9 shrink-0 px-0 md:hidden"
                variant="ghost"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu size={16} />
              </Button>

              {/* Space label */}
              <div className="hidden min-w-[140px] sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
                  {query ? "Global results" : "Space"}
                </p>
                <h2 className="truncate text-sm font-semibold text-bone-500 leading-tight mt-0.5">
                  {query ? "Search" : selectedSpace?.name}
                </h2>
              </div>

              {/* Search */}
              <GlobalSearch value={query} onChange={setQuery} resultCount={resultCount} />

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1.5">
                <Button onClick={openCreateCard} className="gap-1.5 bg-accent text-accent-text hover:opacity-90 shadow-inner-bright px-3 sm:px-4 transition-opacity">
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
            {/* Notice banner */}
            {notice ? (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-ink-850 px-3.5 py-2.5 text-sm text-bone-400 animate-slide-up">
                <span>{notice}</span>
                <button
                  onClick={() => setNotice("")}
                  className="text-stone-600 hover:text-bone-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}

            {/* Daily panel */}
            {selectedSpace?.id === "daily" && !query ? (
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
                {query ? " across Homebase" : selectedSpace ? ` in ${selectedSpace.name}` : ""}
              </p>
              <label className="flex items-center gap-2 text-[12px] text-stone-600">
                <Filter size={14} />
                <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as CardType | "all")}>
                  <SelectTrigger className="h-8 w-32 bg-ink-850 border-white/[0.07] text-[12px]">
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

            {/* Cards */}
            <CardGrid
              cards={filteredCards}
              hasFilters={Boolean(query) || typeFilter !== "all"}
              density={data.settings.cards.density}
              onCreateCard={openCreateCard}
              onEdit={(card) => {
                setEditingCard(card);
                setEditorOpen(true);
              }}
              onDelete={(card) => setPendingDelete({ kind: "card", card })}
              onTogglePin={togglePin}
              onToggleTask={toggleTask}
            />
          </div>
        </section>
      </main>

      <CardEditor
        open={editorOpen}
        spaceId={selectedSpace?.id ?? data.spaces[0]?.id ?? "daily"}
        card={editingCard}
        defaultType={data.settings.cards.defaultType}
        onClose={() => setEditorOpen(false)}
        onSave={saveCard}
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

      <SettingsPanel
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
      />
    </div>
  );
}
