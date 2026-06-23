import { HomebaseData } from "../../types";
import { validateHomebaseData, normalizeHomebaseData } from "../storage/storage";

export function downloadBackup(data: HomebaseData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `homebase-backup-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readBackupFile(file: File): Promise<HomebaseData> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!validateHomebaseData(parsed)) {
    throw new Error("This file is not a valid Homebase backup.");
  }
  return normalizeHomebaseData(parsed);
}
