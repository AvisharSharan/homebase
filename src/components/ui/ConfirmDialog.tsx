import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { buttonVariants } from "./button";

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
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-ink-900 p-5 shadow-panel">
        <AlertDialogHeader>
          <div className="flex gap-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400">
              <AlertTriangle size={17} />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <AlertDialogTitle className="text-sm font-semibold text-bone-500">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-[13px] leading-5 text-stone-500">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-5 sm:justify-end gap-2">
          <AlertDialogCancel onClick={onCancel} className="mt-0 border-white/10 bg-ink-800 hover:bg-ink-700 hover:text-bone-500 text-stone-400 transition">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={buttonVariants({ variant: "destructive" })}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
