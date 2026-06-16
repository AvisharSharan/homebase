import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, Filter, Menu, Plus, Upload, X } from "lucide-react";
import { CardEditor } from "./components/cards/CardEditor";
import { CardGrid } from "./components/cards/CardGrid";
import { DailyPanel } from "./components/daily/DailyPanel";
import { GlobalSearch } from "./components/search/GlobalSearch";
import { Sidebar } from "./components/spaces/Sidebar";
import { Button } from "./components/ui/Button";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import { downloadBackup, readBackupFile } from "./lib/export/backup";
import { createId } from "./lib/id";
import { loadHomebaseData, saveHomebaseData } from "./lib/storage/storage";
import { CardType, HomebaseCard, HomebaseData, Space } from "./types";

const allTypes: Array<CardType | "all"> = ["all", "note", "task", "link", "reference", "snippet"];

type PendingDelete =
  | { kind: "card"; card: HomebaseCard }
  | { kind: "space"; space: Space }
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

function sortCards(cards: HomebaseCard[]) {
  return [...cards].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveHomebaseData(data);
  }, [data]);

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
    );
  }, [data.cards, data.spaces, query, searchQuery, selectedSpace?.id, typeFilter]);

  const resultCount = query
    ? filteredCards.length +
      data.spaces.filter((space) => normalize(space.name).includes(searchQuery)).length
    : 0;

  const dailyTaskCards = data.cards.filter((card) => card.spaceId === "daily" && card.type === "task");
  const pinnedLinks = data.cards.filter((card) => card.type === "link" && card.pinned);

  function mutate(updater: (current: HomebaseData) => HomebaseData) {
    setData((current) => ({ ...updater(current), updatedAt: new Date().toISOString() }));
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
    const name = window.prompt("Name this space");
    if (!name?.trim()) return;
    const timestamp = new Date().toISOString();
    const space: Space = { id: createId("space"), name: name.trim(), createdAt: timestamp, updatedAt: timestamp };
    mutate((current) => ({ ...current, spaces: [...current.spaces, space] }));
    setSelectedSpaceId(space.id);
  }

  function renameSpace(spaceId: string) {
    const space = data.spaces.find((item) => item.id === spaceId);
    if (!space) return;
    const name = window.prompt("Rename space", space.name);
    if (!name?.trim()) return;
    mutate((current) => ({
      ...current,
      spaces: current.spaces.map((item) =>
        item.id === spaceId ? { ...item, name: name.trim(), updatedAt: new Date().toISOString() } : item,
      ),
    }));
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

  const deleteTitle = pendingDelete?.kind === "space" ? "Delete space?" : "Delete card?";
  const deleteDescription =
    pendingDelete?.kind === "space"
      ? `This will remove "${pendingDelete.space.name}" and all cards inside it.`
      : pendingDelete?.kind === "card"
        ? `This will permanently remove "${pendingDelete.card.title}".`
        : "";

  return (
    <div className="flex h-screen overflow-hidden text-bone-500">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          spaces={data.spaces}
          selectedSpaceId={selectedSpace?.id ?? ""}
          cardCounts={cardCounts}
          onSelectSpace={setSelectedSpaceId}
          onCreateSpace={createSpace}
          onRenameSpace={renameSpace}
          onDeleteSpace={(spaceId) => {
            const space = data.spaces.find((item) => item.id === spaceId);
            if (space && data.spaces.length > 1) setPendingDelete({ kind: "space", space });
          }}
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
            />
          </div>
        </div>
      ) : null}

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-white/[0.06] bg-ink-950/80 px-4 py-3 backdrop-blur">
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
              <Button variant="primary" onClick={openCreateCard} className="gap-1.5">
                <Plus size={16} />
                <span className="hidden sm:inline">New card</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => downloadBackup(data)}
                title="Export JSON backup"
                className="size-10 px-0"
              >
                <Upload size={16} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                title="Import JSON backup"
                className="size-10 px-0"
              >
                <Download size={16} />
              </Button>
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={importBackup} />
            </div>
          </div>
        </header>

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
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as CardType | "all")}
                  className="h-8 rounded-lg border border-white/[0.07] bg-ink-850 px-2.5 text-[12px] text-bone-400 outline-none transition hover:border-white/12 focus:border-amber-500/25"
                >
                  {allTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All types" : type}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Cards */}
            <CardGrid
              cards={filteredCards}
              hasFilters={Boolean(query) || typeFilter !== "all"}
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
    </div>
  );
}
