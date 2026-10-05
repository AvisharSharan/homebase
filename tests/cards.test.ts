import { test } from "node:test";
import assert from "node:assert/strict";
import { reorderCards } from "../src/lib/cards";
import { HomebaseCard } from "../src/types";
const timestamp = "2026-10-04T00:00:00.000Z";
function card(id: string, pinned = false): HomebaseCard {
  return { id, type: "note", spaceId: "daily", title: id, content: "", tags: [], pinned, createdAt: timestamp, updatedAt: timestamp };
}
test("dragging uses displayed order and leaves hidden cards in place", () => {
  const cards = [card("a"), card("hidden"), card("b"), card("c")];
  assert.deepEqual(reorderCards(cards, ["c", "b", "a"], "c", "a").map(c => c.id), ["b", "hidden", "a", "c"]);
  assert.deepEqual(cards.map(c => c.id), ["a", "hidden", "b", "c"]);
});
test("invalid drags and drags across pinned groups are ignored", () => {
  const cards = [card("a", true), card("b")];
  assert.equal(reorderCards(cards, ["a", "b"], "missing", "b"), cards);
  assert.equal(reorderCards(cards, ["a", "b"], "a", "b"), cards);
});
