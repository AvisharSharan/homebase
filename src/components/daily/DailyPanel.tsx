import { useMemo } from "react";
import { Link2 } from "lucide-react";
import { DailyState, HomebaseCard, SettingsData } from "../../types";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { FocusTimer } from "./FocusTimer";
import { safeWebUrl } from "../../lib/url";

interface DailyPanelProps {
  daily: DailyState;
  dailyTasks: HomebaseCard[];
  pinnedLinks: HomebaseCard[];
  settings: SettingsData;
  onDailyChange: (daily: DailyState) => void;
  onToggleTask: (cardId: string, taskId: string) => void;
}

const moods = ["sharp", "steady", "calm", "tired", "restless"] as const;

const GREETINGS = [
  "Welcome back",
  "Ready to focus?",
  "What's on your mind today?",
  "Let's get things done",
  "Good to see you",
  "Have a productive day",
];

export function DailyPanel({ daily, dailyTasks, pinnedLinks, settings, onDailyChange, onToggleTask }: DailyPanelProps) {
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const randomGreeting = useMemo(() => {
    return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  }, []);

  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border-white/[0.07] bg-ink-900 shadow-card">
      {/* Top strip — date + mood */}
      <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-bone-500 tracking-tight">
            {settings.daily.greetingText || randomGreeting}
            {settings.profile.displayName ? `, ${settings.profile.displayName}` : ""}
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            {date}
          </p>
        </div>

        {/* Mood chips */}
        <div className="flex flex-wrap gap-1.5">
          {moods.map((mood) => {
            const isLight = settings.appearance.theme === "snow";
            const activeMoodColors: Record<string, string> = {
              sharp: isLight ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-600" : "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
              steady: isLight ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
              calm: isLight ? "border-violet-500/50 bg-violet-500/10 text-violet-600" : "border-violet-500/40 bg-violet-500/10 text-violet-400",
              tired: isLight ? "border-stone-500/50 bg-stone-500/10 text-stone-600" : "border-stone-500/40 bg-stone-500/10 text-stone-400",
              restless: isLight ? "border-rose-500/50 bg-rose-500/10 text-rose-600" : "border-rose-500/40 bg-rose-500/10 text-rose-400",
            };

            return (
              <button
                aria-pressed={daily.mood === mood}
                key={mood}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  daily.mood === mood
                    ? activeMoodColors[mood] || "border-white/40 bg-white text-black"
                    : "border-white/[0.07] bg-ink-850 text-stone-500 hover:border-white/14 hover:text-bone-400"
                }`}
                onClick={() => onDailyChange({ ...daily, mood })}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focus + columns */}
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-5">
          <div className="grid gap-2 flex-1 min-w-0">
            <Label htmlFor="daily-focus" className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Today's focus
            </Label>
            <Input
              id="daily-focus"
              value={daily.focus}
              onChange={(event) => onDailyChange({ ...daily, focus: event.target.value })}
              placeholder="What matters most today?"
              className="h-12 border-white/[0.07] bg-ink-850 text-xl font-semibold leading-tight text-bone-500 focus-visible:border-white/20 focus-visible:bg-ink-800"
            />
          </div>
          <div className="sm:mt-[18px]">
            <FocusTimer mood={daily.mood} isLightMode={settings.appearance.theme === "snow"} />
          </div>
        </div>

        <div className={`grid gap-4 ${settings.daily.showJournal && settings.daily.showPinnedLinks ? "lg:grid-cols-3" : settings.daily.showJournal || settings.daily.showPinnedLinks ? "lg:grid-cols-2" : ""}`}>
          {settings.daily.showJournal && (
          <div className="grid gap-2">
            <Label htmlFor="daily-notes" className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              Quick notes
            </Label>
            <Textarea
              id="daily-notes"
              value={daily.quickNotes}
              onChange={(event) => onDailyChange({ ...daily, quickNotes: event.target.value })}
              rows={5}
              placeholder="Brain dump, ideas, thoughts..."
              className="min-h-[130px] resize-none border-white/[0.07] bg-ink-850 text-sm leading-6 text-bone-400 focus-visible:border-white/20 focus-visible:bg-ink-800"
            />
          </div>
          )}

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
                  ? card.tasks.map((task) => (
                      <label
                        key={`${card.id}-${task.id}`}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.05] bg-ink-850 px-3 py-2 text-left text-xs text-bone-400 transition hover:border-white/10 hover:text-bone-300 cursor-pointer"
                      >
                        <Checkbox
                          aria-label={task.text}
                          checked={task.completed}
                          onCheckedChange={() => onToggleTask(card.id, task.id)}
                          className="border-white/15 data-[state=checked]:bg-green-500/15 data-[state=checked]:text-green-400 data-[state=checked]:border-green-500/50"
                        />
                        <span className={`min-w-0 [overflow-wrap:anywhere] ${task.completed ? "text-stone-600 line-through" : ""}`}>
                          {task.text}
                        </span>
                      </label>
                    ))
                  : [],
              )}
            </div>
          </div>

          {settings.daily.showPinnedLinks && (
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
              {pinnedLinks.map((card) =>
                card.type === "link" && safeWebUrl(card.url) ? (
                  <a
                    key={card.id}
                    href={safeWebUrl(card.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-ink-850 px-3 py-2 text-xs text-bone-400 transition hover:border-white/12 hover:text-bone-300"
                  >
                    <Link2 size={14} className="shrink-0 text-green-500" />
                    <span className="truncate">{card.title}</span>
                  </a>
                ) : null,
              )}
            </div>
          </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
