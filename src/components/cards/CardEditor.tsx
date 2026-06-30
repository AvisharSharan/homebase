import { FormEvent, useEffect, useMemo, useState } from "react";
import { CardType, HomebaseCard, TaskItem } from "../../types";
import { createId } from "../../lib/id";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../ui/sheet";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface CardEditorProps {
  open: boolean;
  spaceId: string;
  card?: HomebaseCard | null;
  defaultType?: CardType;
  onClose: () => void;
  onSave: (card: HomebaseCard) => void;
}

const cardTypes: CardType[] = ["note", "task", "link", "reference", "snippet"];

export function CardEditor({ open, spaceId, card, defaultType = "note", onClose, onSave }: CardEditorProps) {
  const [type, setType] = useState<CardType>("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [url, setUrl] = useState("");
  const [reference, setReference] = useState("");
  const [language, setLanguage] = useState("text");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const isEditing = Boolean(card);

  useEffect(() => {
    if (!open) return;
    setType(card?.type ?? defaultType);
    setTitle(card?.title ?? "");
    setContent(card?.content ?? "");
    setTags(card?.tags.join(", ") ?? "");
    setUrl(card?.type === "link" ? card.url : "");
    setReference(card?.type === "reference" ? card.reference : "");
    setLanguage(card?.type === "snippet" ? card.language : "text");
    setTasks(card?.type === "task" ? card.tasks : [{ id: createId("task"), text: "", completed: false }]);
    setIsPreview(false);
  }, [card, open]);

  const drawerTitle = useMemo(() => (isEditing ? "Edit card" : "New card"), [isEditing]);

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
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg border-l border-white/[0.07] bg-ink-900 p-0 flex flex-col gap-0 shadow-panel text-bone-500">
        {/* Drawer header */}
        <SheetHeader className="border-b border-white/[0.06] px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold text-bone-500">{drawerTitle}</SheetTitle>
          <SheetDescription className="mt-0.5 text-[11px] text-stone-600">Stored locally in this browser.</SheetDescription>
        </SheetHeader>

        <form className="flex-1 overflow-y-auto flex flex-col" onSubmit={submit}>
          <div className="flex-1 p-5 space-y-5">
            {/* Type selector — pill toggles */}
            <div className="grid gap-2.5">
              <Label className="text-[11px] font-semibold uppercase tracking-widest text-stone-600">Type</Label>
              <div className="flex gap-1.5 flex-wrap">
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
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-[11px] font-semibold uppercase tracking-widest text-stone-600">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give this card a name..."
                className="h-10 border-white/[0.07] bg-ink-850 focus-visible:border-white/20 focus-visible:bg-ink-800"
              />
            </div>

            {/* Content */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-[11px] font-semibold uppercase tracking-widest text-stone-600">Content</Label>
                {type === "note" && (
                  <div className="flex items-center gap-1 rounded-md bg-ink-950 p-0.5 border border-white/[0.05]">
                    <button
                      type="button"
                      onClick={() => setIsPreview(false)}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-sm transition-colors ${!isPreview ? 'bg-ink-800 text-bone-500 shadow-sm' : 'text-stone-500 hover:text-bone-400'}`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPreview(true)}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-sm transition-colors ${isPreview ? 'bg-ink-800 text-bone-500 shadow-sm' : 'text-stone-500 hover:text-bone-400'}`}
                    >
                      Preview
                    </button>
                  </div>
                )}
              </div>
              
              {type === "note" && isPreview ? (
                <div className="min-h-[120px] rounded-md border border-white/[0.07] bg-ink-900 p-3 prose prose-sm prose-invert max-w-none text-stone-500 prose-headings:text-bone-500 prose-a:text-accent prose-code:text-accent-text prose-strong:text-bone-400 prose-ul:my-1 prose-p:my-1 text-[13px] leading-6 overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {content || "*Nothing to preview yet...*"}
                  </ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={type === "snippet" ? 9 : 5}
                  placeholder={type === "note" ? "Supports full Markdown! Try **bold**, *italics*, lists, or code blocks..." : type === "snippet" ? "Paste your code snippet here..." : "Add notes, details, or context..."}
                  className="resize-y border-white/[0.07] bg-ink-850 focus-visible:border-white/20 focus-visible:bg-ink-800 font-mono text-[13px]"
                />
              )}
            </div>

            {/* Task items */}
            {type === "task" && (
              <div className="grid gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-widest text-stone-600">Task items</Label>
                <div className="space-y-2">
                  {tasks.map((task, i) => (
                    <Input
                      key={task.id}
                      value={task.text}
                      onChange={(event) => updateTask(task.id, event.target.value)}
                      placeholder={`Item ${i + 1}...`}
                      className="h-10 border-white/[0.07] bg-ink-850 focus-visible:border-white/20 focus-visible:bg-ink-800"
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
              <div className="grid gap-2">
                <Label htmlFor="url" className="text-[11px] font-semibold uppercase tracking-widest text-stone-600">URL</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://"
                  className="h-10 border-white/[0.07] bg-ink-850 focus-visible:border-white/20 focus-visible:bg-ink-800"
                />
              </div>
            )}

            {/* Reference */}
            {type === "reference" && (
              <div className="grid gap-2">
                <Label htmlFor="reference" className="text-[11px] font-semibold uppercase tracking-widest text-stone-600">Reference</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="File, book, folder, or source..."
                  className="h-10 border-white/[0.07] bg-ink-850 focus-visible:border-white/20 focus-visible:bg-ink-800"
                />
              </div>
            )}

            {/* Language */}
            {type === "snippet" && (
              <div className="grid gap-2">
                <Label htmlFor="language" className="text-[11px] font-semibold uppercase tracking-widest text-stone-600">Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  placeholder="ts, js, py, text..."
                  className="h-10 border-white/[0.07] bg-ink-850 focus-visible:border-white/20 focus-visible:bg-ink-800"
                />
              </div>
            )}

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags" className="text-[11px] font-semibold uppercase tracking-widest text-stone-600">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="comma, separated, tags"
                className="h-10 border-white/[0.07] bg-ink-850 focus-visible:border-white/20 focus-visible:bg-ink-800"
              />
            </div>
          </div>

          {/* Footer actions */}
          <SheetFooter className="p-5 border-t border-white/[0.06] bg-ink-900 sm:justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save changes" : "Create card"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
