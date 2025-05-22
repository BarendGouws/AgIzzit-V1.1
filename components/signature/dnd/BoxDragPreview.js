import { memo } from 'react';
import { Box } from './Box';

function getStyles(width, height, zoom) { 

   return {
    display: 'inline-block',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Add a shadow for hover effect
    transform: 'scale(1.05)', // Slightly increase size to simulate hover
    WebkitTransform: 'scale(1.05)',
    transition: 'transform 0.2s ease', // Smooth transition
    width: `${Number(width)*zoom}px`, 
    height: `${Number(height)*zoom}px`,     
  };
}

export const BoxDragPreview = memo(function BoxDragPreview({ item }) { 
  return (
    <div style={getStyles(item.width, item.height, item.zoom)}>
      <Box role={item.role} type={item.type} preview />
    </div>
  );
});

export default BoxDragPreview;
