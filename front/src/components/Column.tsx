import { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/react';
import { CollisionPriority } from '@dnd-kit/abstract';
import { Box, Typography } from '@mui/material';

interface ColumnProps {
  children: ReactNode;
  id: string;
}

export function Column({ children, id }: ColumnProps) {
  const { isDropTarget, setNodeRef } = useDroppable({
    id,
    data: { type: 'column' },
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });
  const style = isDropTarget ? { backgroundColor: '#e0e0e0' } : undefined;

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, minWidth: 200, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        {id}
      </Typography>
      <Box ref={setNodeRef} sx={{ flexGrow: 1, ...style }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>drop here</Typography>
        {children}
      </Box>
    </Box>
  );
}
