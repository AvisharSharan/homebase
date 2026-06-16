import { Search, X } from "lucide-react";
import { Input } from "../ui/input";

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export function GlobalSearch({ value, onChange, resultCount }: GlobalSearchProps) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center">
      <Search
        className="pointer-events-none absolute left-3 text-stone-600"
        size={16}
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search spaces, cards, tags..."
        className="h-9 w-full rounded-lg border-white/[0.07] bg-ink-850 px-10 text-sm text-bone-500 transition placeholder:text-stone-600 focus-visible:border-white/20 focus-visible:bg-ink-800 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0"
      />
      {value ? (
        <>
          <span className="absolute right-9 hidden text-[11px] text-stone-600 sm:block">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </span>
          <button
            onClick={() => onChange("")}
            className="absolute right-2.5 grid size-5 place-items-center rounded text-stone-600 hover:text-bone-400 transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        </>
      ) : null}
    </div>
  );
}
