import { memo, useState } from 'react';
import { Card } from 'react-bootstrap';

export const Box = memo(function Box({ onResizeStart, type, preview, _id, deleteBox, role }) { 

  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    border: isHovered ? '1px dashed gray' : 'none', // Show border only on hover
    cursor: 'move',
    position: 'relative',
    padding: '4px',
    boxSizing: 'border-box',
    height: '100%',
    width: '100%',
    transition: 'border 0.2s ease', // Smooth transition for border
    color: 'white',
  };

  return (
    <div style={styles} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} role={ preview ? 'BoxPreview' : 'Box' } >
      <Card className={'bg-info text-white h-100'} style={{ margin: '0', height: '100%', width: '100%'}}>
        <Card.Body className="d-flex flex-column justify-content-center align-items-center p-2">
          <div className="text-center" style={{ fontSize: '7px' }}>
            {role}
            <div style={{ fontSize: '5px', fontWeight: 'bold' }}>{type}</div>
          </div>
        </Card.Body>
      </Card>

      {/* Trash Icon */}
      {isHovered && ( // Show trash icon only on hover
        <div 
          onClick={() => _id && deleteBox(_id)}
          style={{ 
            position: 'absolute', 
            top: '-15px', 
            right: '-15px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '24px', 
            height: '24px', 
            borderRadius: '50%', // Make the container circle
            backgroundColor: 'white', // Background color for the circle
            border: '1px solid gray', // Optional: Add border to the circle
          }}
        >
          <i className="las la-trash" style={{ color: 'red', cursor: 'pointer', fontSize: '14px' }}></i>
        </div>
      )}

      {/* Resize Handle */}
      {isHovered && ( // Show resize handle only on hover
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '16px',  // Increase size for a more visible handle
            height: '16px', // Increase size for a more visible handle
            cursor: 'nwse-resize',
          }}
          onMouseDown={onResizeStart}
        >
          {/* 90-degree dark corner */}
          <div
            style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '15px',  // Horizontal part of the corner
              height: '2px',
              backgroundColor: 'black',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              height: '15px', // Vertical part of the corner
              width: '2px',
              backgroundColor: 'black',
            }}
          />
        </div>
      )}
    </div>
  );
  
});
