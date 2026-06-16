import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { HomebaseMark } from "../brand/HomebaseMark";
import { Space } from "../../types";
import { Button } from "../ui/Button";

interface SidebarProps {
  spaces: Space[];
  selectedSpaceId: string;
  cardCounts: Record<string, number>;
  onSelectSpace: (spaceId: string) => void;
  onCreateSpace: () => void;
  onRenameSpace: (spaceId: string) => void;
  onDeleteSpace: (spaceId: string) => void;
}

export function Sidebar({
  spaces,
  selectedSpaceId,
  cardCounts,
  onSelectSpace,
  onCreateSpace,
  onRenameSpace,
  onDeleteSpace,
}: SidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/[0.07] bg-ink-950 px-3 py-5 md:w-64">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-2 pb-5 border-b border-white/[0.07]">
        <div className="grid size-9 place-items-center rounded-lg bg-ink-800 text-bone-500 ring-1 ring-white/10">
          <HomebaseMark className="size-[22px]" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-[0.01em] text-bone-500">Homebase</h1>
          <p className="text-[11px] text-stone-600 leading-tight mt-0.5">Personal command OS</p>
        </div>
      </div>

      {/* Spaces section */}
      <div className="mt-5 flex items-center justify-between px-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">Spaces</span>
        <Button
          className="size-9 px-0 rounded-md"
          variant="ghost"
          onClick={onCreateSpace}
          title="Create space"
        >
          <Plus size={16} />
        </Button>
      </div>

      <div className="mt-2 flex-1 space-y-0.5 overflow-y-auto">
        {spaces.map((space) => {
          const active = selectedSpaceId === space.id;
          return (
            <div
              key={space.id}
              className={`group flex items-center rounded-lg transition-all duration-150 ${
                active
                  ? "bg-ink-800 ring-1 ring-white/[0.07]"
                  : "hover:bg-ink-850"
              }`}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left"
                onClick={() => onSelectSpace(space.id)}
              >
                <span
                  className={`truncate text-sm transition-colors ${
                    active ? "font-medium text-bone-500" : "text-stone-500 group-hover:text-bone-400"
                  }`}
                >
                  {space.name}
                </span>
                <span
                  className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums transition-colors ${
                    active ? "text-stone-400" : "text-stone-600 group-hover:text-stone-500"
                  }`}
                >
                  {cardCounts[space.id] ?? 0}
                </span>
              </button>

              {/* Context actions — appear on hover */}
              <div className="flex items-center gap-0.5 pr-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  className="grid size-7 place-items-center rounded text-stone-600 hover:text-bone-400 hover:bg-white/[0.06] transition-colors"
                  onClick={() => onRenameSpace(space.id)}
                  title="Rename"
                >
                  <MoreHorizontal size={15} />
                </button>
                <button
                  className="grid size-7 place-items-center rounded text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  onClick={() => onDeleteSpace(space.id)}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="mt-4 pt-4 border-t border-white/[0.07] px-2">
        <p className="text-[11px] leading-5 text-stone-600">
          Local-first. All data stays in this browser.
        </p>
      </footer>
    </aside>
  );
}
