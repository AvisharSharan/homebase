import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { DEFAULT_TIME, remainingSeconds } from "../../lib/timer";

interface FocusTimerProps {
  mood: string;
  isLightMode: boolean;
}

const TIMER_KEY = "homebase:focus-timer";
function loadTimer(): { remaining: number; deadline: number | null } {
  try {
    const raw = JSON.parse(sessionStorage.getItem(TIMER_KEY) || "null");
    if (raw && Number.isFinite(raw.remaining) && raw.remaining >= 0 && raw.remaining <= DEFAULT_TIME &&
      (raw.deadline === null || Number.isFinite(raw.deadline))) {
      return { remaining: raw.deadline === null ? raw.remaining : remainingSeconds(raw.deadline), deadline: raw.deadline };
    }
  } catch { /* Timer remains usable when session storage is blocked. */ }
  return { remaining: DEFAULT_TIME, deadline: null };
}

export function FocusTimer({ mood, isLightMode }: FocusTimerProps) {
  const [timer, setTimer] = useState(loadTimer);
  const [timeLeft, setTimeLeft] = useState(timer.remaining);
  const isRunning = timer.deadline !== null && timeLeft > 0;

  useEffect(() => {
    if (timer.deadline === null) { setTimeLeft(timer.remaining); return; }
    const tick = () => {
      const remaining = remainingSeconds(timer.deadline!);
      setTimeLeft(remaining);
      if (remaining === 0) setTimer({ remaining: 0, deadline: null });
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    try { sessionStorage.setItem(TIMER_KEY, JSON.stringify(timer)); } catch { /* Nonessential persistence. */ }
  }, [timer]);

  function toggleTimer() {
    if (isRunning) {
      const remaining = remainingSeconds(timer.deadline!);
      setTimer({ remaining, deadline: null });
    } else {
      const remaining = timeLeft || DEFAULT_TIME;
      setTimeLeft(remaining);
      setTimer({ remaining, deadline: Date.now() + remaining * 1000 });
    }
  }

  function resetTimer(e: React.MouseEvent) {
    e.stopPropagation();
    setTimer({ remaining: DEFAULT_TIME, deadline: null });
    setTimeLeft(DEFAULT_TIME);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((DEFAULT_TIME - timeLeft) / DEFAULT_TIME) * 100;
  
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const moodColors: Record<string, { stroke: string; glow: string }> = {
    sharp: { stroke: isLightMode ? "text-cyan-500" : "text-cyan-400", glow: "shadow-[0_0_15px_rgba(6,182,212,0.3)]" },
    steady: { stroke: isLightMode ? "text-emerald-500" : "text-emerald-400", glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
    calm: { stroke: isLightMode ? "text-violet-500" : "text-violet-400", glow: "shadow-[0_0_15px_rgba(139,92,246,0.3)]" },
    tired: { stroke: isLightMode ? "text-stone-500" : "text-stone-400", glow: "shadow-[0_0_15px_rgba(120,113,108,0.3)]" },
    restless: { stroke: isLightMode ? "text-rose-500" : "text-rose-400", glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]" },
  };

  const activeColor = moodColors[mood] || moodColors.calm;

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`relative size-14 flex items-center justify-center rounded-full transition-all duration-500 ${isRunning ? activeColor.glow : ""}`}
      >
        <svg className="size-14 -rotate-90" viewBox="0 0 56 56">
          <circle
            cx="28"
            cy="28"
            r={radius}
            className={`fill-none ${isLightMode ? "stroke-black/[0.06]" : "stroke-white/[0.05]"}`}
            strokeWidth="3"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-linear ${activeColor.stroke} ${isRunning ? "animate-pulse" : ""}`}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
          />
        </svg>
        <button
          aria-label={isRunning ? "Pause focus timer" : "Start focus timer"}
          onClick={toggleTimer}
          className="absolute inset-0 flex items-center justify-center rounded-full text-bone-400 hover:text-white transition-colors group"
        >
          {isRunning ? (
            <Pause size={16} className="fill-current" />
          ) : (
            <Play size={16} className="fill-current" />
          )}
        </button>
      </div>

      <div className="flex flex-col justify-center min-w-[50px]">
        <span role="timer" aria-label="Time remaining" className={`text-xl font-mono tracking-tight font-medium ${isRunning ? activeColor.stroke : "text-bone-500"}`}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        {timeLeft < DEFAULT_TIME && (
          <button 
            onClick={resetTimer}
            className="text-[10px] text-stone-500 hover:text-stone-400 flex items-center gap-1 mt-0.5"
          >
            <RotateCcw size={10} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
