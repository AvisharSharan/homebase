import { Check, Code2, ExternalLink, FileText, Link2, ListChecks, Pin, PinOff, Trash2 } from "lucide-react";
import { CardType, HomebaseCard } from "../../types";
import { Button } from "../ui/Button";

const typeIcons: Record<CardType, typeof FileText> = {
  note: FileText,
  task: ListChecks,
  link: Link2,
  reference: FileText,
  snippet: Code2,
};

interface CardViewProps {
  card: HomebaseCard;
  onEdit: (card: HomebaseCard) => void;
  onDelete: (card: HomebaseCard) => void;
  onTogglePin: (cardId: string) => void;
  onToggleTask: (cardId: string, taskId: string) => void;
}

export function CardView({ card, onEdit, onDelete, onTogglePin, onToggleTask }: CardViewProps) {
  const Icon = typeIcons[card.type];

  return (
    <article className="group relative flex min-h-[200px] flex-col rounded-xl border border-white/[0.07] bg-ink-900 p-4 shadow-card transition-all duration-200 hover:border-white/[0.13] hover:shadow-card-hover hover:-translate-y-px">
      {/* Pinned green top strip */}
      {card.pinned && (
        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full bg-green-500/60" />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Card header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* Type badge */}
            <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
              <Icon size={13} />
              <span>{card.type}</span>
              {card.pinned && (
                <Pin size={13} className="text-green-500 ml-0.5" />
              )}
            </div>
            {/* Title */}
            <button className="block text-left" onClick={() => onEdit(card)}>
              <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-bone-500 hover:text-white transition-colors">
                {card.title}
              </h3>
            </button>
          </div>

          {/* Card actions */}
          <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Button
              className="size-9 px-0 rounded-md"
              variant="ghost"
              onClick={() => onTogglePin(card.id)}
              title={card.pinned ? "Unpin" : "Pin card"}
            >
              {card.pinned
                ? <PinOff size={15} className="text-green-500" />
                : <Pin size={15} />
              }
            </Button>
            <Button
              className="size-9 px-0 rounded-md"
              variant="ghost"
              onClick={() => onDelete(card)}
              title="Delete card"
            >
              <Trash2 size={15} className="text-red-400" />
            </Button>
          </div>
        </div>

        {/* Card body */}
        <div className="mt-3 flex-1 text-sm leading-6 text-stone-500">
          {card.type === "task" ? (
            <div className="space-y-1.5">
              {card.tasks.map((task) => (
                <button
                  key={task.id}
                  className="flex w-full items-start gap-2.5 rounded-lg p-1.5 text-left hover:bg-white/[0.04] transition-colors"
                  onClick={() => onToggleTask(card.id, task.id)}
                >
                  <span
                    className={`mt-0.5 grid size-[15px] shrink-0 place-items-center rounded border transition-colors ${
                      task.completed
                        ? "border-green-500/50 bg-green-500/15 text-green-400"
                        : "border-white/15 text-transparent"
                    }`}
                  >
                    <Check size={10} />
                  </span>
                  <span className={`text-[13px] leading-5 ${task.completed ? "text-stone-600 line-through" : "text-bone-400"}`}>
                    {task.text}
                  </span>
                </button>
              ))}
            </div>
          ) : card.type === "snippet" ? (
            <pre className="max-h-36 overflow-auto rounded-lg border border-white/[0.07] bg-ink-950 p-3 font-mono text-xs text-stone-400 leading-5">
              <code>{card.content}</code>
            </pre>
          ) : (
            <p className="line-clamp-5 whitespace-pre-wrap text-[13px] leading-6 text-stone-500">
              {card.content}
            </p>
          )}

          {card.type === "link" && (
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-bone-400 hover:text-white transition-colors"
            >
              <ExternalLink size={14} className="text-green-500" />
              Open link
            </a>
          )}
          {card.type === "reference" && (
            <p className="mt-3 text-[11px] text-stone-600 font-mono">{card.reference}</p>
          )}
        </div>

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/[0.07] bg-ink-800 px-2 py-0.5 text-[11px] text-stone-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
