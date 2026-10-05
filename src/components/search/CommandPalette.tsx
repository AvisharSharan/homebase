import { Command } from "cmdk";
import { FileText, ListChecks, Link2, Code2, Sun, Folder, Search } from "lucide-react";
import { Space, CardType, HomebaseCard } from "../../types";
import * as Dialog from "@radix-ui/react-dialog";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaces: Space[];
  cards: HomebaseCard[];
  onSelectSpace: (id: string) => void;
  onCreateCard: (type: CardType) => void;
  onToggleTheme: () => void;
  onSelectCard: (card: HomebaseCard) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  spaces,
  cards,
  onSelectSpace,
  onCreateCard,
  onToggleTheme,
  onSelectCard,
}: CommandPaletteProps) {
  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Global Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-ink-900 shadow-2xl animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <Dialog.Title className="sr-only">Search and commands</Dialog.Title>
        <Dialog.Description className="sr-only">Find cards, choose spaces, or create a card.</Dialog.Description>
          <div className="flex items-center border-b border-white/10 px-4">
            <Search className="mr-2 h-5 w-5 text-stone-500 shrink-0" />
            <Command.Input
              aria-label="Search commands"
              autoFocus
              placeholder="Type a command or search..."
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-stone-500 text-bone-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-stone-500">No results found.</Command.Empty>
            
            <Command.Group heading="Create Card" className="px-2 py-1.5 text-xs font-medium text-stone-500">
              <Command.Item
                onSelect={() => { onCreateCard("note"); onOpenChange(false); }}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-bone-500 text-stone-400 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors"
              >
                <FileText className="mr-2 h-4 w-4" /> Create Note
              </Command.Item>
              <Command.Item
                onSelect={() => { onCreateCard("task"); onOpenChange(false); }}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-bone-500 text-stone-400 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors"
              >
                <ListChecks className="mr-2 h-4 w-4" /> Create Task List
              </Command.Item>
              <Command.Item
                onSelect={() => { onCreateCard("link"); onOpenChange(false); }}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-bone-500 text-stone-400 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors"
              >
                <Link2 className="mr-2 h-4 w-4" /> Save Link
              </Command.Item>
              <Command.Item onSelect={() => { onCreateCard("reference"); onOpenChange(false); }} className="flex cursor-pointer items-center rounded px-2 py-2 text-sm aria-selected:bg-white/10">
                <FileText className="mr-2 h-4 w-4" /> Create Reference
              </Command.Item>
              <Command.Item onSelect={() => { onCreateCard("snippet"); onOpenChange(false); }} className="flex cursor-pointer items-center rounded px-2 py-2 text-sm aria-selected:bg-white/10">
                <Code2 className="mr-2 h-4 w-4" /> Create Snippet
              </Command.Item>
            </Command.Group>

            {spaces.length > 0 && (
              <Command.Group heading="Switch Space" className="px-2 py-1.5 text-xs font-medium text-stone-500 mt-2">
                {spaces.map(space => (
                  <Command.Item
                    key={space.id}
                    value={`space ${space.id}`}
                    keywords={[space.name]}
                    onSelect={() => { onSelectSpace(space.id); onOpenChange(false); }}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-bone-500 text-stone-400 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors"
                  >
                    <Folder className="mr-2 h-4 w-4 text-stone-500" /> {space.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Actions" className="px-2 py-1.5 text-xs font-medium text-stone-500 mt-2">
              <Command.Item
                onSelect={() => { onToggleTheme(); onOpenChange(false); }}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-bone-500 text-stone-400 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors"
              >
                <Sun className="mr-2 h-4 w-4" /> Toggle Theme
              </Command.Item>
            </Command.Group>

            {cards.length > 0 && (
              <Command.Group heading="Cards" className="px-2 py-1.5 text-xs font-medium text-stone-500 mt-2">
                {cards.map(card => (
                  <Command.Item
                    key={card.id}
                    value={`card ${card.id}`}
                    keywords={[card.title, card.content, ...card.tags, ...(card.type === "task" ? card.tasks.map(task => task.text) : []), ...(card.type === "link" ? [card.url] : []), ...(card.type === "reference" ? [card.reference] : [])]}
                    onSelect={() => { onSelectCard(card); onOpenChange(false); }}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-bone-500 text-stone-400 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors"
                  >
                    <FileText className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <span className="truncate">{card.title || "Untitled Card"}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
      </div>
    </Command.Dialog>
  );
}
