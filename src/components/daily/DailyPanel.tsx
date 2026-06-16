import { Check, Link2, StickyNote } from "lucide-react";
import { DailyState, HomebaseCard } from "../../types";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface DailyPanelProps {
  daily: DailyState;
  dailyTasks: HomebaseCard[];
  pinnedLinks: HomebaseCard[];
  onDailyChange: (daily: DailyState) => void;
  onToggleTask: (cardId: string, taskId: string) => void;
}

const moods = ["sharp", "steady", "calm", "tired", "restless"] as const;

export function DailyPanel({ daily, dailyTasks, pinnedLinks, onDailyChange, onToggleTask }: DailyPanelProps) {
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border-white/[0.07] bg-ink-900 shadow-card">
      {/* Top strip — date + mood */}
      <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-stone-600">
            <StickyNote size={12} />
            Daily
          </div>
          <p className="mt-1 text-sm text-bone-400">{date}</p>
        </div>

        {/* Mood chips */}
        <div className="flex flex-wrap gap-1.5">
          {moods.map((mood) => (
            <button
              key={mood}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                daily.mood === mood
                  ? "border-white/40 bg-white text-black"
                  : "border-white/[0.07] bg-ink-850 text-stone-500 hover:border-white/14 hover:text-bone-400"
              }`}
              onClick={() => onDailyChange({ ...daily, mood })}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Focus + columns */}
      <CardContent className="p-5">
        <div className="grid gap-2">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
            Today's focus
          </Label>
          <Input
            value={daily.focus}
            onChange={(event) => onDailyChange({ ...daily, focus: event.target.value })}
            placeholder="What matters most today?"
            className="h-12 border-white/[0.07] bg-ink-850 text-xl font-semibold leading-tight text-bone-500 focus-visible:border-white/20 focus-visible:bg-ink-800"
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.85fr_0.85fr]">
          {/* Quick notes */}
          <div className="grid gap-2">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Quick notes
            </Label>
            <Textarea
              value={daily.quickNotes}
              onChange={(event) => onDailyChange({ ...daily, quickNotes: event.target.value })}
              rows={5}
              placeholder="Brain dump, ideas, thoughts..."
              className="min-h-[130px] resize-none border-white/[0.07] bg-ink-850 text-sm leading-6 text-bone-400 focus-visible:border-white/20 focus-visible:bg-ink-800"
            />
          </div>

          {/* Today's tasks */}
          <div className="grid gap-2 content-start">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Today's tasks
            </Label>
            <div className="space-y-1.5">
              {dailyTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/[0.07] px-3 py-2 text-xs text-stone-700">
                  No daily task cards yet.
                </p>
              ) : null}
              {dailyTasks.flatMap((card) =>
                card.type === "task"
                  ? card.tasks.slice(0, 5).map((task) => (
                      <label
                        key={`${card.id}-${task.id}`}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.05] bg-ink-850 px-3 py-2 text-left text-xs text-bone-400 transition hover:border-white/10 hover:text-bone-300 cursor-pointer"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => onToggleTask(card.id, task.id)}
                          className="border-white/15 data-[state=checked]:bg-green-500/15 data-[state=checked]:text-green-400 data-[state=checked]:border-green-500/50"
                        />
                        <span className={task.completed ? "text-stone-600 line-through" : ""}>
                          {task.text}
                        </span>
                      </label>
                    ))
                  : [],
              )}
            </div>
          </div>

          {/* Pinned links */}
          <div className="grid gap-2 content-start">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Pinned links
            </Label>
            <div className="space-y-1.5">
              {pinnedLinks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/[0.07] px-3 py-2 text-xs text-stone-700">
                  Pin links to keep them here.
                </p>
              ) : null}
              {pinnedLinks.slice(0, 4).map((card) =>
                card.type === "link" ? (
                  <a
                    key={card.id}
                    href={card.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-ink-850 px-3 py-2 text-xs text-bone-400 transition hover:border-white/12 hover:text-bone-300"
                  >
                    <Link2 size={14} className="shrink-0 text-green-500" />
                    <span className="truncate">{card.title}</span>
                  </a>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
