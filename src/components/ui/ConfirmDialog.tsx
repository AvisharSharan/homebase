import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-ink-900 p-5 shadow-panel animate-slide-up">
        <div className="flex gap-3.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400">
            <AlertTriangle size={17} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-bone-500">{title}</h2>
            <p className="mt-1.5 text-[13px] leading-5 text-stone-500">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
