import { CardDensity, HomebaseCard } from "../../types";
import { CardView } from "./CardView";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/button";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';

interface CardGridProps {
  cards: HomebaseCard[];
  hasFilters: boolean;
  density?: CardDensity;
  onCreateCard: () => void;
  onEdit: (card: HomebaseCard) => void;
  onDelete: (card: HomebaseCard) => void;
  onTogglePin: (cardId: string) => void;
  onToggleTask: (cardId: string, taskId: string) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

export function CardGrid({ cards, hasFilters, density = "comfortable", onCreateCard, onEdit, onDelete, onTogglePin, onToggleTask, onDragEnd }: CardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  if (cards.length === 0) {
    return (
      <EmptyState
        title={hasFilters ? "No matching cards" : "This space is ready"}
        description={
          hasFilters
            ? "Try a different search term or card type filter."
            : "Add a note, task list, link, reference, or snippet to make this space useful."
        }
        action={!hasFilters ? <Button onClick={onCreateCard} variant="secondary">Create a card</Button> : null}
      />
    );
  }

  const gapClass = density === "compact" ? "gap-2" : "gap-3";

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
        <div className={`grid grid-cols-1 ${gapClass} sm:grid-cols-2 xl:grid-cols-3`}>
          {cards.map((card) => (
            <CardView
              key={card.id}
              card={card}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onToggleTask={onToggleTask}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
