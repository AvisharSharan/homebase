import { HomebaseData } from "../../types";
import { validateHomebaseData, normalizeHomebaseData } from "../storage/storage";

export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadBackup(data: HomebaseData) {
  const date = new Date().toISOString().slice(0, 10);
  downloadText(JSON.stringify(data, null, 2), `homebase-backup-${date}.json`);
}

export async function readBackupFile(file: File): Promise<HomebaseData> {
  if (file.size > MAX_BACKUP_BYTES) throw new Error("Backup is too large. Maximum size is 5 MB.");
  const text = await file.text();
  let parsed: unknown;
  try { parsed = JSON.parse(text); }
  catch { throw new Error("This file is not valid JSON."); }
  if (!validateHomebaseData(parsed)) {
    throw new Error("This file is not a valid Homebase backup.");
  }
  return normalizeHomebaseData(parsed);
}
