import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface FocusTimerProps {
  mood: string;
  isLightMode: boolean;
}

const DEFAULT_TIME = 25 * 60; // 25 minutes

export function FocusTimer({ mood, isLightMode }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  function toggleTimer() {
    if (timeLeft === 0) {
      setTimeLeft(DEFAULT_TIME);
    }
    setIsRunning(!isRunning);
  }

  function resetTimer(e: React.MouseEvent) {
    e.stopPropagation();
    setIsRunning(false);
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
            className="stroke-white/[0.05] fill-none"
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
        <span className={`text-xl font-mono tracking-tight font-medium ${isRunning ? activeColor.stroke : "text-bone-500"}`}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        {timeLeft < DEFAULT_TIME && !isRunning && (
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
