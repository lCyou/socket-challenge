import { ReactNode } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Button } from '@mui/material';

interface ItemProps {
  id: string;
  index: number;
  column: string;
  children: ReactNode;
}

export function Item({ id, index, column, children }: ItemProps) {
  const { setNodeRef, isDragging } = useSortable({
    id,
    index,
    data: { type: "item", column },
    group: column,
  });

  return (
    <Button
      ref={setNodeRef}
      variant="outlined"
      sx={{
        my: 1,
        width: '100%',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        borderColor: isDragging ? 'primary.main' : 'grey.400',
        color: 'text.primary',
        textTransform: 'none',
      }}
    >
      {children}
    </Button>
  );
}