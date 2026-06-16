import { Check, Link2, StickyNote } from "lucide-react";
import { DailyState, HomebaseCard } from "../../types";

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
    <section className="mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900 shadow-card">
      {/* Top strip — date + mood */}
      <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-stone-600">
            <StickyNote size={12} />
            Daily
          </div>
          <p className="mt-1 text-sm text-bone-400">{date}</p>
        </div>

        {/* Mood chips — B&W, active = white fill */}
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
      <div className="p-5">
        <label className="grid gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
            Today's focus
          </span>
          <input
            value={daily.focus}
            onChange={(event) => onDailyChange({ ...daily, focus: event.target.value })}
            placeholder="What matters most today?"
            className="w-full rounded-lg border border-white/[0.07] bg-ink-850 px-3 py-2.5 text-xl font-semibold leading-tight text-bone-500 outline-none transition placeholder:text-stone-700 focus:border-white/20 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
          />
        </label>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.85fr_0.85fr]">
          {/* Quick notes */}
          <label className="grid gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Quick notes
            </span>
            <textarea
              value={daily.quickNotes}
              onChange={(event) => onDailyChange({ ...daily, quickNotes: event.target.value })}
              rows={5}
              placeholder="Brain dump, ideas, thoughts..."
              className="min-h-[130px] resize-none rounded-lg border border-white/[0.07] bg-ink-850 px-3 py-2.5 text-sm leading-6 text-bone-400 outline-none transition placeholder:text-stone-700 focus:border-white/20 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
            />
          </label>

          {/* Today's tasks */}
          <div className="grid gap-2 content-start">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Today's tasks
            </span>
            <div className="space-y-1.5">
              {dailyTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/[0.07] px-3 py-2 text-xs text-stone-700">
                  No daily task cards yet.
                </p>
              ) : null}
              {dailyTasks.flatMap((card) =>
                card.type === "task"
                  ? card.tasks.slice(0, 5).map((task) => (
                      <button
                        key={`${card.id}-${task.id}`}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.05] bg-ink-850 px-3 py-2 text-left text-xs text-bone-400 transition hover:border-white/10 hover:text-bone-300"
                        onClick={() => onToggleTask(card.id, task.id)}
                      >
                        <span
                          className={`grid size-[15px] shrink-0 place-items-center rounded border transition-colors ${
                            task.completed
                              ? "border-green-500/50 bg-green-500/15 text-green-400"
                              : "border-white/15 text-transparent"
                          }`}
                        >
                          <Check size={10} />
                        </span>
                        <span className={task.completed ? "text-stone-600 line-through" : ""}>
                          {task.text}
                        </span>
                      </button>
                    ))
                  : [],
              )}
            </div>
          </div>

          {/* Pinned links */}
          <div className="grid gap-2 content-start">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Pinned links
            </span>
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
      </div>
    </section>
  );
}
