import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { CheckCircle2, Folder, LayoutTemplate } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function WelcomeModal({ open, onOpenChange, onComplete }: WelcomeModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-white/10 bg-ink-950 p-6 shadow-2xl">
        <AlertDialogHeader className="mb-4">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-ink-900 border border-white/10 shadow-inner-bright">
            <img src="/brand/homebase_logo.svg" alt="Homebase" className="size-7 object-contain" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-bold text-bone-500">
            Welcome to Homebase
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-[13px] text-stone-400 mt-2">
            Your personal, local-first command center. Everything you type here stays completely private in your browser.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-white/5 p-2 text-stone-400">
              <Folder className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bone-500">Spaces</p>
              <p className="text-[13px] text-stone-500 leading-snug">Organize your life into different areas like Work, Personal, or Side Projects.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-white/5 p-2 text-stone-400">
              <LayoutTemplate className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bone-500">Cards</p>
              <p className="text-[13px] text-stone-500 leading-snug">Create notes, task lists, code snippets, and link bookmarks inside your spaces.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-white/5 p-2 text-stone-400">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bone-500">Daily Planner</p>
              <p className="text-[13px] text-stone-500 leading-snug">Set a daily focus, jot quick notes, and track your mood every single day.</p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction 
            onClick={onComplete}
            className="w-full bg-bone-500 text-ink-950 hover:bg-white font-medium"
          >
            Get Started
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
