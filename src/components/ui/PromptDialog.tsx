import { useEffect, useRef, useState } from "react";
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
import { Input } from "./input";

interface PromptDialogProps {
  open: boolean;
  title: string;
  description?: string;
  defaultValue?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({
  open,
  title,
  description,
  defaultValue = "",
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, defaultValue]);

  function handleConfirm() {
    if (!value.trim()) return;
    onConfirm(value.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      handleConfirm();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-md border-white/10 bg-ink-950 p-5 sm:p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-bone-500">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-stone-400">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <div className="py-2">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-ink-900 border-white/10 text-bone-500 placeholder:text-stone-600 focus-visible:ring-1 focus-visible:ring-white/30"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="border-white/10 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={!value.trim()}
            className="bg-bone-500 text-ink-950 hover:bg-bone-400 disabled:opacity-50"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
