import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  // Solid white primary
  primary:
    "border-white/50 bg-white text-black font-semibold shadow-inner-bright hover:bg-bone-400 hover:border-white/70 active:scale-[0.98]",
  // Subtle dark surface
  secondary:
    "border-white/8 bg-ink-800 text-bone-400 hover:border-white/14 hover:bg-ink-700 hover:text-bone-500 active:scale-[0.98]",
  // Transparent ghost
  ghost:
    "border-transparent bg-transparent text-stone-500 hover:bg-white/[0.06] hover:text-bone-400 active:scale-[0.98]",
  // Red danger
  danger:
    "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/18 hover:border-red-500/50 active:scale-[0.98]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

export function Button({ children, variant = "secondary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
