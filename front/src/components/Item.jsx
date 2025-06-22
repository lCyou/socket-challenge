import React from "react";

import { useSortable } from "@dnd-kit/react/sortable";
// import { useDraggable } from "@dnd-kit/react";

export function Item({ id, index, column, children }) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "item",
    accept: "item",
    group: column,
  });

  return (
    <button className="Item" ref={ref} data-dragging={isDragging}>
      {children}
    </button>
  );
}
