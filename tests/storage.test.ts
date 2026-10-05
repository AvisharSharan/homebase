import { test } from "node:test";
import assert from "node:assert/strict";
import { blankData } from "../src/data/sampleData";
import { defaultSettings } from "../src/data/defaults";
import { getStorageWarning, loadHomebaseData, normalizeHomebaseData, normalizeSettings, RECOVERY_KEY, saveHomebaseData, STORAGE_KEY, validateHomebaseData } from "../src/lib/storage/storage";
import { MAX_BACKUP_BYTES, readBackupFile } from "../src/lib/export/backup";
import { safeWebUrl } from "../src/lib/url";
import { remainingSeconds } from "../src/lib/timer";

function storage(raw?: string) {
  const values = new Map<string, string>(raw === undefined ? [] : [[STORAGE_KEY, raw]]);
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  } } });
  return values;
}
test("storage denial does not stop startup", () => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    get localStorage() { throw new DOMException("Denied", "SecurityError"); },
  } });
  assert.equal(loadHomebaseData().spaces[0].id, "daily");
  assert.match(getStorageWarning(), /temporary/);
});
test("missing data returns an independent default", () => {
  storage();
  const data = loadHomebaseData();
  data.settings.profile.displayName = "Edited";
  assert.equal(defaultSettings.profile.displayName, "");
  assert.equal(loadHomebaseData().settings.profile.displayName, "");
});
test("corrupt data is retained and copied before an edit replaces it", () => {
  const values = storage("{bad json");
  const data = loadHomebaseData();
  assert.match(getStorageWarning(), /preserved/);
  assert.equal(values.get(STORAGE_KEY), "{bad json");
  saveHomebaseData(data);
  assert.equal(values.get(RECOVERY_KEY), "{bad json");
  assert.ok(validateHomebaseData(JSON.parse(values.get(STORAGE_KEY)!)));
});
test("quota failure retains the original saved value", () => {
  const raw = JSON.stringify(blankData);
  const values = storage(raw);
  const data = loadHomebaseData();
  window.localStorage.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); };
  assert.throws(() => saveHomebaseData(data), /Full/);
  assert.equal(values.get(STORAGE_KEY), raw);
});
test("failed recovery write never overwrites damaged saved data", () => {
  const values = storage("broken");
  const data = loadHomebaseData();
  window.localStorage.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); };
  assert.throws(() => saveHomebaseData(data));
  assert.equal(values.get(STORAGE_KEY), "broken");
});
test("another tab's edits cannot be silently overwritten", () => {
  const values = storage(JSON.stringify(blankData));
  const data = loadHomebaseData();
  values.set(STORAGE_KEY, "another tab");
  assert.throws(() => saveHomebaseData(data), /another tab/);
  assert.equal(values.get(STORAGE_KEY), "another tab");
});
test("malformed settings become safe defaults without mutating source", () => {
  const bad = { appearance: { theme: {} }, profile: { avatar: {}, displayName: [] },
    cards: { defaultType: "malicious", density: [], sortOrder: null }, daily: { showJournal: "false" } };
  assert.deepEqual(normalizeSettings(bad), defaultSettings);
  const data = structuredClone(blankData);
  Object.assign(data, { settings: bad });
  assert.ok(validateHomebaseData(data));
  const fixed = normalizeHomebaseData(data);
  assert.equal(fixed.settings.profile.avatar, "👤");
  assert.equal(typeof data.settings.profile.avatar, "object");
});
test("legacy backups regain Daily and onboarding flag", () => {
  const data = structuredClone(blankData);
  data.spaces[0].id = "work";
  data.cards.forEach(card => { card.spaceId = "work"; });
  delete (data as Partial<typeof data>).settings;
  delete (data as Partial<typeof data>).hasSeenWelcome;
  assert.ok(validateHomebaseData(data));
  const fixed = normalizeHomebaseData(data);
  assert.equal(fixed.spaces[0].id, "daily");
  assert.equal(fixed.hasSeenWelcome, true);
  assert.deepEqual(fixed.settings, defaultSettings);
});
test("invalid graph, duplicate IDs, task shape and timestamps are rejected", () => {
  const duplicate = structuredClone(blankData);
  duplicate.cards.push(duplicate.cards[0]);
  assert.equal(validateHomebaseData(duplicate), false);
  const orphan = structuredClone(blankData);
  orphan.cards[0].spaceId = "missing";
  assert.equal(validateHomebaseData(orphan), false);
  const badDate = structuredClone(blankData);
  badDate.spaces[0].updatedAt = "invalid";
  assert.equal(validateHomebaseData(badDate), false);
  const tasks = structuredClone(blankData);
  const task = tasks.cards.find(card => card.type === "task")!;
  if (task.type === "task") task.tasks.push(task.tasks[0]);
  assert.equal(validateHomebaseData(tasks), false);
});
test("duplicate tags are normalized", () => {
  const data = structuredClone(blankData);
  data.cards[0].tags = ["same", "same"];
  assert.deepEqual(normalizeHomebaseData(data).cards[0].tags, ["same"]);
});
test("backup import rejects invalid JSON, shape, and oversized files", async () => {
  await assert.rejects(readBackupFile(new File(["{"], "bad.json")), /valid JSON/);
  await assert.rejects(readBackupFile(new File(["{}"], "bad.json")), /valid Homebase/);
  await assert.rejects(readBackupFile({ size: MAX_BACKUP_BYTES + 1 } as File), /too large/);
  const restored = await readBackupFile(new File([JSON.stringify(blankData)], "valid.json"));
  assert.equal(restored.cards.length, blankData.cards.length);
});
test("saved URLs only allow absolute HTTP(S) without credentials", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,hello", "file:///C:/secret", "//example.com", "/relative", "https://user:pass@example.com", ""]) {
    assert.equal(safeWebUrl(url), undefined, url);
  }
  assert.equal(safeWebUrl(" https://example.com "), "https://example.com/");
  assert.equal(safeWebUrl("http://localhost:8080"), "http://localhost:8080/");
});
test("timer follows elapsed wall time and never becomes negative", () => {
  assert.equal(remainingSeconds(10000, 1000), 9);
  assert.equal(remainingSeconds(10000, 5500), 5);
  assert.equal(remainingSeconds(10000, 15000), 0);
});
