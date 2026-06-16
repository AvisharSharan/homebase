import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-ink-900/40 p-10 text-center animate-slide-up">
      {/* Hexagonal placeholder echoing the logo mark */}
      <div className="mb-5 grid size-12 place-items-center rounded-xl border border-white/[0.08] bg-ink-850 text-stone-600">
        <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
          <path
            d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-bone-400">{title}</p>
      <p className="mt-2 max-w-xs text-[13px] leading-6 text-stone-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
