import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";
import { Box } from '@mui/material';

interface DropAreaProps {
  children: ReactNode;
  id: string;
}

const DropArea: React.FC<DropAreaProps> = ({ children, id }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: { type: 'column' },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        width: '300px',
        height: '300px',
        padding: '10px',
        borderRadius: '8px',
        margin: '20px',
        border: '2px solid #ccc',
        backgroundColor: isOver ? '#e0e0e0' : '#fff',
      }}
    >
      {children}
    </Box>
  );
};

export default DropArea;
