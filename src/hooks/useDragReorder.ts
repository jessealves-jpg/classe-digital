import { useCallback, DragEvent, ReactNode, useRef, useState } from 'react';

interface UseDragReorderOptions {
  items: { id: string }[];
  onReorder: (newOrder: string[]) => void;
}

/**
 * Hook for drag-and-drop reordering of a list of items.
 * Returns handlers to spread onto draggable items and the drop container.
 * Auto-saves the new order via onReorder callback.
 */
export function useDragReorder({ items, onReorder }: UseDragReorderOptions) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (e: DragEvent, id: string, index: number) => {
      dragIndex.current = index;
      setDraggingId(id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: DragEvent, id: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverId(id);
    },
    []
  );

  const handleDrop = useCallback(
    (e: DragEvent, targetId: string, targetIndex: number) => {
      e.preventDefault();
      const fromIdx = dragIndex.current;
      if (fromIdx === null || fromIdx === targetIndex) {
        setDraggingId(null);
        setDragOverId(null);
        return;
      }
      const newOrder = items.map((i) => i.id);
      const [moved] = newOrder.splice(fromIdx, 1);
      newOrder.splice(targetIndex, 0, moved);
      onReorder(newOrder);
      setDraggingId(null);
      setDragOverId(null);
      dragIndex.current = null;
    },
    [items, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
    dragIndex.current = null;
  }, []);

  const getItemProps = (id: string, index: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => handleDragStart(e, id, index),
    onDragOver: (e: DragEvent) => handleDragOver(e, id),
    onDrop: (e: DragEvent) => handleDrop(e, id, index),
    onDragEnd: handleDragEnd,
    className: `${draggingId === id ? 'dragging' : ''} ${dragOverId === id && draggingId !== id ? 'drag-over' : ''}`,
  });

  return { getItemProps, draggingId, dragOverId };
}

export type DragItemProps = ReturnType<ReturnType<typeof useDragReorder>['getItemProps']>;
