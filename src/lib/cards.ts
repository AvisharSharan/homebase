import { HomebaseCard } from "../types";
export function reorderCards(cards: HomebaseCard[], visibleIds: string[], activeId: string, overId: string) {
  const byId = new Map(cards.map(card => [card.id, card]));
  const visible = visibleIds.map(id => byId.get(id)).filter((card): card is HomebaseCard => !!card);
  const from = visible.findIndex(card => card.id === activeId);
  const to = visible.findIndex(card => card.id === overId);
  if (from < 0 || to < 0 || from === to || visible[from].pinned !== visible[to].pinned) return cards;
  const [moved] = visible.splice(from, 1);
  visible.splice(to, 0, moved);
  const ids = new Set(visibleIds);
  let index = 0;
  return cards.map(card => ids.has(card.id) ? visible[index++] : card);
}
