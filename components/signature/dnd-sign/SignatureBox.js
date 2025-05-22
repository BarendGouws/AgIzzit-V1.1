import { memo } from 'react';
import { Card } from 'react-bootstrap';

function getStyles(left, top, width, height) {

  const transform = `translate3d(${left}px, ${top}px, 0)`; 
  return {
    position: 'absolute',
    transform,
    WebkitTransform: transform,
    opacity: 1,
    width: `${width}px`, 
    height: `${height}px`,     
  };
}

const styles = {
  border: 'none', // Show border only on hover
  cursor: 'move',
  position: 'relative',
  padding: '4px',
  boxSizing: 'border-box',
  height: '100%',
  width: '100%',
  transition: 'border 0.2s ease', // Smooth transition for border
  color: 'white',
};

export const SignatureBox = memo(function SignatureBox(props) { console.log('SignatureBox props:', props);

  const { _id, left, top, type, width, height, role, showSignatureModal } = props; 

  return (
    <div style={getStyles(left, top, width, height)} onClick={() => { showSignatureModal({_id, type, role}) }}>
      <div style={styles}>
        <Card className={'bg-info text-white h-100'} style={{ margin: '0', height: '100%', width: '100%'}}>
          <Card.Body className="d-flex flex-column justify-content-center align-items-center p-2">
            <div className="text-center" style={{ fontSize: '7px' }}>
              {role}
              <div style={{ fontSize: '5px', fontWeight: 'bold' }}>{type}</div>
            </div>
          </Card.Body>
        </Card>     
      </div>
    </div>
  );

});

export default SignatureBox;
