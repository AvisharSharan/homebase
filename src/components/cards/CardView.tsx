import { Check, Code2, ExternalLink, FileText, Link2, ListChecks, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { CardType, HomebaseCard } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex min-h-[200px] flex-col rounded-xl border border-white/[0.07] bg-ink-900 shadow-card transition-all duration-200 hover:border-white/[0.13] hover:shadow-card-hover ${isDragging ? 'cursor-grabbing border-white/20' : 'cursor-grab hover:-translate-y-px'}`}
    >
      {/* Pinned green top strip */}
      {card.pinned && (
        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full bg-green-500/60" />
      )}

      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-4 pb-0">
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
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-8 px-0 rounded-md"
                  variant="ghost"
                  onClick={() => onEdit(card)}
                >
                  <Pencil size={14} className="text-stone-400 hover:text-bone-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit card</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-8 px-0 rounded-md"
                  variant="ghost"
                  onClick={() => onTogglePin(card.id)}
                >
                  {card.pinned
                    ? <PinOff size={15} className="text-green-500" />
                    : <Pin size={15} />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>{card.pinned ? "Unpin" : "Pin card"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-8 px-0 rounded-md"
                  variant="ghost"
                  onClick={() => onDelete(card)}
                >
                  <Trash2 size={15} className="text-red-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete card</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="mt-3 flex-1 p-4 pt-0 text-sm leading-6 text-stone-500">
        {card.type === "task" ? (
          <div className="space-y-1.5">
            {card.tasks.map((task) => (
              <label
                key={task.id}
                className="flex w-full items-start gap-2.5 rounded-lg p-1.5 text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(card.id, task.id)}
                  className="mt-0.5 border-white/15 data-[state=checked]:bg-green-500/15 data-[state=checked]:text-green-400 data-[state=checked]:border-green-500/50"
                />
                <span className={`text-[13px] leading-5 ${task.completed ? "text-stone-600 line-through" : "text-bone-400"}`}>
                  {task.text}
                </span>
              </label>
            ))}
          </div>
        ) : card.type === "snippet" ? (
          <pre className="max-h-36 overflow-auto rounded-lg border border-white/[0.07] bg-ink-950 p-3 font-mono text-xs text-stone-400 leading-5">
            <code>{card.content}</code>
          </pre>
        ) : card.type === "note" ? (
          <div className="prose prose-sm prose-invert max-w-none text-stone-500 line-clamp-[8]
                          prose-headings:text-bone-500 prose-a:text-accent prose-code:text-accent-text
                          prose-strong:text-bone-400 prose-ul:my-1 prose-p:my-1 text-[13px] leading-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {card.content}
            </ReactMarkdown>
          </div>
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
      </CardContent>

      {card.tags.length > 0 && (
        <CardFooter className="p-4 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-md border border-white/[0.07] bg-ink-800 hover:bg-ink-800 px-2 py-0.5 text-[11px] font-normal text-stone-500"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
