import { FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { CardType, HomebaseCard, TaskItem } from "../../types";
import { createId } from "../../lib/id";
import { Button } from "../ui/Button";

interface CardEditorProps {
  open: boolean;
  spaceId: string;
  card?: HomebaseCard | null;
  onClose: () => void;
  onSave: (card: HomebaseCard) => void;
}

const cardTypes: CardType[] = ["note", "task", "link", "reference", "snippet"];

const inputClass =
  "h-10 w-full rounded-lg border border-white/[0.07] bg-ink-850 px-3 text-sm text-bone-500 outline-none transition placeholder:text-stone-700 focus:border-white/20 focus:bg-ink-800 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]";

const textareaClass =
  "w-full resize-y rounded-lg border border-white/[0.07] bg-ink-850 px-3 py-2.5 text-sm leading-6 text-bone-500 outline-none transition placeholder:text-stone-700 focus:border-white/20 focus:bg-ink-800 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]";

const labelClass = "grid gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-600";

export function CardEditor({ open, spaceId, card, onClose, onSave }: CardEditorProps) {
  const [type, setType] = useState<CardType>("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [url, setUrl] = useState("");
  const [reference, setReference] = useState("");
  const [language, setLanguage] = useState("text");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const isEditing = Boolean(card);

  useEffect(() => {
    if (!open) return;
    setType(card?.type ?? "note");
    setTitle(card?.title ?? "");
    setContent(card?.content ?? "");
    setTags(card?.tags.join(", ") ?? "");
    setUrl(card?.type === "link" ? card.url : "");
    setReference(card?.type === "reference" ? card.reference : "");
    setLanguage(card?.type === "snippet" ? card.language : "text");
    setTasks(card?.type === "task" ? card.tasks : [{ id: createId("task"), text: "", completed: false }]);
  }, [card, open]);

  const drawerTitle = useMemo(() => (isEditing ? "Edit card" : "New card"), [isEditing]);

  if (!open) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const timestamp = new Date().toISOString();
    const base = {
      id: card?.id ?? createId("card"),
      type,
      title: title.trim() || "Untitled card",
      content,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      pinned: card?.pinned ?? false,
      createdAt: card?.createdAt ?? timestamp,
      updatedAt: timestamp,
      spaceId: card?.spaceId ?? spaceId,
    };

    if (type === "task") {
      onSave({
        ...base,
        type,
        tasks: tasks.filter((task) => task.text.trim()).map((task) => ({ ...task, text: task.text.trim() })),
      });
    } else if (type === "link") {
      onSave({ ...base, type, url: url.trim() });
    } else if (type === "reference") {
      onSave({ ...base, type, reference: reference.trim() });
    } else if (type === "snippet") {
      onSave({ ...base, type, language: language.trim() || "text" });
    } else {
      onSave({ ...base, type });
    }
  }

  function updateTask(taskId: string, text: string) {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, text } : task)));
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ml-auto flex h-full w-full max-w-lg flex-col border-l border-white/[0.07] bg-ink-900 shadow-panel animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-bone-500">{drawerTitle}</h2>
            <p className="mt-0.5 text-[11px] text-stone-600">Stored locally in this browser.</p>
          </div>
          <Button className="size-9 px-0 rounded-lg" variant="ghost" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <form className="flex-1 overflow-y-auto p-5" onSubmit={submit}>
          <div className="grid gap-5">
            {/* Type selector — pill toggles */}
            <div className={labelClass}>
              Type
              <div className="flex gap-1.5 flex-wrap mt-0.5">
                {cardTypes.map((cardType) => (
                  <button
                    key={cardType}
                    type="button"
                    disabled={isEditing}
                    onClick={() => setType(cardType)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      type === cardType
                        ? "border-white/30 bg-white/10 text-bone-500"
                        : "border-white/[0.07] bg-ink-850 text-stone-500 hover:border-white/14 hover:text-bone-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    }`}
                  >
                    {cardType}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <label className={labelClass}>
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give this card a name..."
                className={inputClass}
              />
            </label>

            {/* Content */}
            <label className={labelClass}>
              Content
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={type === "snippet" ? 9 : 5}
                placeholder={type === "snippet" ? "Paste your code snippet here..." : "Add notes, details, or context..."}
                className={textareaClass}
              />
            </label>

            {/* Task items */}
            {type === "task" && (
              <div className="grid gap-2">
                <span className={labelClass.split(" grid")[0]}>Task items</span>
                <div className="space-y-2">
                  {tasks.map((task, i) => (
                    <input
                      key={task.id}
                      value={task.text}
                      onChange={(event) => updateTask(task.id, event.target.value)}
                      placeholder={`Item ${i + 1}...`}
                      className={inputClass}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-1 self-start text-xs h-8"
                  onClick={() => setTasks((current) => [...current, { id: createId("task"), text: "", completed: false }])}
                >
                  + Add item
                </Button>
              </div>
            )}

            {/* URL */}
            {type === "link" && (
              <label className={labelClass}>
                URL
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://"
                  className={inputClass}
                />
              </label>
            )}

            {/* Reference */}
            {type === "reference" && (
              <label className={labelClass}>
                Reference
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="File, book, folder, or source..."
                  className={inputClass}
                />
              </label>
            )}

            {/* Language */}
            {type === "snippet" && (
              <label className={labelClass}>
                Language
                <input
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  placeholder="ts, js, py, text..."
                  className={inputClass}
                />
              </label>
            )}

            {/* Tags */}
            <label className={labelClass}>
              Tags
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="comma, separated, tags"
                className={inputClass}
              />
            </label>
          </div>

          {/* Footer actions */}
          <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t border-white/[0.06] bg-ink-900 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? "Save changes" : "Create card"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
