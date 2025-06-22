import { useDroppable } from "@dnd-kit/react";

const DropArea = ({ children, id }) => {
  const { Dropabble, isDropTarget, ref } = useDroppable({
    id: id,
    type: 'column',
    accept: 'item',
    // collisionPriority: 'low',
    CollisionDetector: "shapeIntersection"
  });

  return (
    <div
      ref={ref}
      style={{ 
        width: '300px',
        height: '300px',
        padding: '10px',
        borderRadius: '8px',
        margin: '20px',
        border: '2px solid #ccc' ,
        backgroundColor: isDropTarget ? '#f0f8ff' : '#fff',
        }}
    >
      {children}
    </div>
  );
}
export default DropArea;