import { Download, MoreHorizontal, Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import { Space } from "../../types";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface SidebarProps {
  spaces: Space[];
  selectedSpaceId: string;
  cardCounts: Record<string, number>;
  onSelectSpace: (spaceId: string) => void;
  onCreateSpace: () => void;
  onRenameSpace: (spaceId: string) => void;
  onDeleteSpace: (spaceId: string) => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

export function Sidebar({
  spaces,
  selectedSpaceId,
  cardCounts,
  onSelectSpace,
  onCreateSpace,
  onRenameSpace,
  onDeleteSpace,
  onExport,
  onImport,
  onReset,
}: SidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/[0.07] bg-ink-950 px-3 py-5 md:w-64">
      {/* Logo / Brand */}
      <div className="px-2 pb-5 border-b border-white/[0.07]">
        <img src="/brand/homebase_logo.svg" alt="Homebase" className="h-9 w-auto object-contain" />
      </div>

      <TooltipProvider delayDuration={200}>
        {/* Spaces section */}
        <div className="mt-5 flex items-center justify-between px-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">Spaces</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="size-8 px-0 rounded-md text-stone-600 hover:text-bone-400 hover:bg-white/[0.06]"
                variant="ghost"
                onClick={onCreateSpace}
              >
                <Plus size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create space</TooltipContent>
          </Tooltip>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="grid size-7 place-items-center rounded text-stone-600 hover:text-bone-400 hover:bg-white/[0.06] transition-colors"
                        onClick={() => onRenameSpace(space.id)}
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Rename</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="grid size-7 place-items-center rounded text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        onClick={() => onDeleteSpace(space.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>

      {/* Footer */}
      <footer className="mt-4 pt-4 border-t border-white/[0.07] px-2 flex flex-col gap-3">
        <div className="flex items-center gap-1 text-stone-400">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={onExport} className="size-8 p-0 hover:bg-white/10 hover:text-white rounded-md transition-colors">
                <Upload size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Backup</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={onImport} className="size-8 p-0 hover:bg-white/10 hover:text-white rounded-md transition-colors">
                <Download size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import Backup</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={onReset} className="size-8 p-0 hover:bg-red-500/10 text-stone-500 hover:text-red-400 rounded-md transition-colors">
                <RotateCcw size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Factory Reset</TooltipContent>
          </Tooltip>
        </div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-600">
          Local-first Command OS
        </p>
      </footer>
      </TooltipProvider>
    </aside>
  );
}
