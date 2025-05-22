import { memo, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Box } from './Box';

function getStyles(left, top, isDragging, width, height) {
  const transform = `translate3d(${left}px, ${top}px, 0)`; 
  return {
    position: 'absolute',
    transform,
    WebkitTransform: transform,
    opacity: isDragging ? 0.5 : 1,
    width: `${width}px`, 
    height: `${height}px`,     
  };
}

export const DraggableBox = memo(function DraggableBox(props) { 

  const { _id, left, top, type, width, height, role, zoom, resizeBox, deleteBox } = props; 
  const initialSize = { width, height };
  const [size, setSize] = useState(initialSize);

  const [{ isDragging }, drag, preview] = useDrag(() => ({

    type: 'box',
    item: { _id, left, top, role, type, width, height, zoom },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),

  }), [_id, left, top, role, type, size.width, size.height, zoom]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const startResizing = (e) => {

    e.preventDefault();
    const startY = e.clientY; // Track the initial Y position
    const startHeight = size.height;
    const aspectRatio = type === 'signature' ? 2.2 : 1;

    const handleMouseMove = (event) => {
        // Calculate new height based on mouse movement, respecting the minimum height
        let newHeight = Math.max(50, startHeight + event.clientY - startY);
        let newWidth = newHeight * aspectRatio;
        setSize({ width: newWidth, height: newHeight });
        resizeBox(_id, newWidth, newHeight); // Save size to state
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div ref={drag} style={getStyles(left, top, isDragging, size.width, size.height)} role="DraggableBox">
      <Box role={role} deleteBox={deleteBox} type={type} _id={_id} onResizeStart={startResizing}/>
    </div>
  );

});

export default DraggableBox;
