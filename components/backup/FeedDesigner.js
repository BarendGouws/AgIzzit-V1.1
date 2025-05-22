"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Accordion, Form, InputGroup } from "react-bootstrap";
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { useDispatch, useSelector } from 'react-redux';
import { HTML5Backend } from "react-dnd-html5-backend";
import { fetchInventorySchema } from "@/redux/manage/slices/advertising";

// Types of elements that can be dragged
const ELEMENT_TYPES = {
  FIELD: 'field',              // Single field like Make, Model
  CONTAINER: 'container',      // Container element like a root or nested node
  CANVAS_ELEMENT: 'canvas-element', // Element that's already on canvas
};

// Different node types for structure
const NODE_TYPES = {
  ROOT: 'root',            // Root node (like <note> or "cars" object)
  CONTAINER: 'container',  // Container node that can have children
  FIELD: 'field',          // Leaf node (simple value)
  ATTRIBUTE: 'attribute',  // XML attribute
};

// Draggable container item component (for root or nested containers)
const DraggableContainerItem = ({ id, name, type = NODE_TYPES.CONTAINER }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ELEMENT_TYPES.CONTAINER,
    item: { id, name, nodeType: type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="mb-2 p-2 border rounded bg-dark text-white"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      {type === NODE_TYPES.ROOT ? `Root: ${name}` : `Container: ${name}`}
    </div>
  );
};

// Draggable field item component
const DraggableFieldItem = ({ id, fieldName, type = "string" }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ELEMENT_TYPES.FIELD,
    item: { id, fieldName, type: type, nodeType: NODE_TYPES.FIELD },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="mb-2 p-2 border rounded bg-light"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      {fieldName} <small className="text-muted">({type})</small>
    </div>
  );
};

// Node on canvas component - represents either a field, container, or root
const CanvasNode = ({ 
  node, 
  level = 0, 
  deleteNode, 
  updateNode, 
  addChildNode, 
  moveNode, 
  format,
  parentId = null
}) => {
  const nodeRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [editValue, setEditValue] = useState(node.value || '');
  const [editKeyName, setEditKeyName] = useState(node.keyName || node.name);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ELEMENT_TYPES.CANVAS_ELEMENT,
    item: { 
      id: node.id, 
      parentId: parentId,
      nodeType: node.nodeType,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: [ELEMENT_TYPES.FIELD, ELEMENT_TYPES.CONTAINER, ELEMENT_TYPES.CANVAS_ELEMENT],
    hover(item, monitor) {
      // Only allow dropping if the node is a container or root
      if (node.nodeType !== NODE_TYPES.CONTAINER && node.nodeType !== NODE_TYPES.ROOT) {
        return;
      }

      if (!nodeRef.current) {
        return;
      }

      // Don't allow dropping on yourself
      if (item.id === node.id) {
        return;
      }
    },
    drop(item, monitor) {
      // Only allow dropping if the node is a container or root and didn't drop on itself
      if ((node.nodeType !== NODE_TYPES.CONTAINER && node.nodeType !== NODE_TYPES.ROOT) || item.id === node.id) {
        return;
      }

      // If the item is already on canvas and has a parent, move it
      if (item.nodeType && item.parentId !== undefined) {
        moveNode(item.id, item.parentId, node.id);
        return { moved: true };
      }

      // If the item is from the sidebar, add as a new node
      if (item.nodeType) {
        const newNode = {
          id: `${item.id}-${Date.now()}`,
          name: item.fieldName || item.name,
          nodeType: item.nodeType,
          keyName: item.fieldName || item.name,
          dataType: item.type || 'string',
          children: item.nodeType === NODE_TYPES.FIELD ? [] : [],
          value: ''
        };
        
        addChildNode(node.id, newNode);
        return { added: true };
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [node, addChildNode, moveNode]);

  const handleSaveEdit = () => {
    updateNode(node.id, {
      ...node,
      name: editName,
      keyName: editKeyName,
      value: editValue
    });
    setIsEditing(false);
  };

  // Combine drag and drop refs
  const dragDropRef = (el) => {
    drag(el);
    drop(el);
    nodeRef.current = el;
  };

  let nodeColor = '';
  switch (node.nodeType) {
    case NODE_TYPES.ROOT:
      nodeColor = 'primary';
      break;
    case NODE_TYPES.CONTAINER:
      nodeColor = 'info';
      break;
    case NODE_TYPES.FIELD:
      nodeColor = 'light';
      break;
    default:
      nodeColor = 'light';
  }

  // Indentation for hierarchy
  const indent = level * 20;

  // For JSON format
  const renderJsonNode = () => {
    if (isEditing) {
      return (
        <div 
          ref={dragDropRef}
          className={`border border-${nodeColor} rounded p-2 mb-2`}
          style={{ 
            marginLeft: `${indent}px`,
            opacity: isDragging ? 0.5 : 1,
            backgroundColor: node.nodeType === NODE_TYPES.ROOT ? '#e6f7ff' : 
                            node.nodeType === NODE_TYPES.CONTAINER ? '#e6fffa' : '#ffffff',
          }}
        >
          <div className="d-flex align-items-center mb-2">
            {node.nodeType !== NODE_TYPES.ROOT && (
              <InputGroup className="mb-2">
                <InputGroup.Text>Key Name</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={editKeyName}
                  onChange={(e) => setEditKeyName(e.target.value)}
                  placeholder="Key name"
                />
              </InputGroup>
            )}
            
            <InputGroup className="mb-2">
              <InputGroup.Text>Display Name</InputGroup.Text>
              <Form.Control
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Display name"
              />
            </InputGroup>
            
            {node.nodeType === NODE_TYPES.FIELD && (
              <InputGroup className="mb-2">
                <InputGroup.Text>Default Value</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Value (optional)"
                />
              </InputGroup>
            )}
          </div>
          
          <div className="d-flex">
            <Button variant="success" size="sm" onClick={handleSaveEdit} className="me-2">Save</Button>
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      );
    }

    // Determine JSON syntax based on node type
    let prefix = '';
    let suffix = '';
    
    if (node.nodeType === NODE_TYPES.ROOT) {
      prefix = '{';
      suffix = node.children.length ? ',' : '}';
    } else if (node.nodeType === NODE_TYPES.CONTAINER) {
      prefix = `"${node.keyName}": {`;
      suffix = node.children.length ? ',' : '},';
    } else { // FIELD
      prefix = `"${node.keyName}": ${node.value ? `"${node.value}"` : '""'},`;
    }

    return (
      <div 
        ref={dragDropRef}
        className={`node-box border-${nodeColor} rounded p-2 mb-1`}
        style={{ 
          marginLeft: `${indent}px`,
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          borderLeft: `3px solid var(--bs-${nodeColor})`,
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <code>{prefix}</code>
          <div>
            <Button variant="outline-secondary" size="sm" className="me-1 py-0 px-2" onClick={() => setIsEditing(true)}>✏️</Button>
            {(node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) && (
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="me-1 py-0 px-2"
                onClick={() => addChildNode(node.id, {
                  id: `field-${Date.now()}`,
                  name: 'New Field',
                  keyName: 'newField',
                  nodeType: NODE_TYPES.FIELD,
                  dataType: 'string',
                  children: [],
                  value: ''
                })}
              >
                + Field
              </Button>
            )}
            {(node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) && (
              <Button 
                variant="outline-info" 
                size="sm" 
                className="me-1 py-0 px-2"
                onClick={() => addChildNode(node.id, {
                  id: `container-${Date.now()}`,
                  name: 'New Container',
                  keyName: 'newContainer',
                  nodeType: NODE_TYPES.CONTAINER,
                  children: [],
                })}
              >
                + Container
              </Button>
            )}
            {node.nodeType !== NODE_TYPES.ROOT && (
              <Button variant="outline-danger" size="sm" className="py-0 px-2" onClick={() => deleteNode(node.id)}>×</Button>
            )}
          </div>
        </div>
        
        {/* Render children */}
        {node.children.map((child) => (
          <CanvasNode 
            key={child.id} 
            node={child} 
            level={level + 1}
            deleteNode={deleteNode}
            updateNode={updateNode}
            addChildNode={addChildNode}
            moveNode={moveNode}
            format={format}
            parentId={node.id}
          />
        ))}
        
        {/* Closing bracket for container types */}
        {(node.nodeType === NODE_TYPES.ROOT || node.nodeType === NODE_TYPES.CONTAINER) && (
          <div style={{ marginLeft: node.children.length ? `${indent + 20}px` : 0 }}>
            <code>{node.nodeType === NODE_TYPES.ROOT && !node.children.length ? '}' : node.children.length ? '},' : ''}</code>
          </div>
        )}
      </div>
    );
  };

  // For XML format
  const renderXmlNode = () => {
    if (isEditing) {
      return (
        <div 
          ref={dragDropRef}
          className={`border border-${nodeColor} rounded p-2 mb-2`}
          style={{ 
            marginLeft: `${indent}px`,
            opacity: isDragging ? 0.5 : 1,
            backgroundColor: node.nodeType === NODE_TYPES.ROOT ? '#e6f7ff' : 
                            node.nodeType === NODE_TYPES.CONTAINER ? '#e6fffa' : '#ffffff',
          }}
        >
          <div className="d-flex align-items-center mb-2">
            <InputGroup className="mb-2">
              <InputGroup.Text>Tag Name</InputGroup.Text>
              <Form.Control
                type="text"
                value={editKeyName}
                onChange={(e) => setEditKeyName(e.target.value)}
                placeholder="XML tag name"
              />
            </InputGroup>
            
            {node.nodeType === NODE_TYPES.FIELD && (
              <InputGroup className="mb-2">
                <InputGroup.Text>Content</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Element content"
                />
              </InputGroup>
            )}
          </div>
          
          <div className="d-flex">
            <Button variant="success" size="sm" onClick={handleSaveEdit} className="me-2">Save</Button>
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      );
    }

    // XML opening and closing tags
    const tag = node.keyName || node.name;
    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;
    
    return (
      <div 
        ref={dragDropRef}
        className={`node-box border-${nodeColor} rounded p-2 mb-1`}
        style={{ 
          marginLeft: `${indent}px`,
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          borderLeft: `3px solid var(--bs-${nodeColor})`,
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <code>{openTag}</code>
          <div>
            <Button variant="outline-secondary" size="sm" className="me-1 py-0 px-2" onClick={() => setIsEditing(true)}>✏️</Button>
            {(node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) && (
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="me-1 py-0 px-2"
                onClick={() => addChildNode(node.id, {
                  id: `field-${Date.now()}`,
                  name: 'element',
                  keyName: 'element',
                  nodeType: NODE_TYPES.FIELD,
                  dataType: 'string',
                  children: [],
                  value: ''
                })}
              >
                + Element
              </Button>
            )}
            {(node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) && (
              <Button 
                variant="outline-info" 
                size="sm" 
                className="me-1 py-0 px-2"
                onClick={() => addChildNode(node.id, {
                  id: `container-${Date.now()}`,
                  name: 'container',
                  keyName: 'container',
                  nodeType: NODE_TYPES.CONTAINER,
                  children: [],
                })}
              >
                + Container
              </Button>
            )}
            {node.nodeType !== NODE_TYPES.ROOT && (
              <Button variant="outline-danger" size="sm" className="py-0 px-2" onClick={() => deleteNode(node.id)}>×</Button>
            )}
          </div>
        </div>
        
        {/* Render content or children */}
        {node.nodeType === NODE_TYPES.FIELD && !node.children.length ? (
          <div style={{ marginLeft: 20 }}>
            <code>{node.value || ''}</code>
          </div>
        ) : (
          node.children.map((child) => (
            <CanvasNode 
              key={child.id} 
              node={child} 
              level={level + 1}
              deleteNode={deleteNode}
              updateNode={updateNode}
              addChildNode={addChildNode}
              moveNode={moveNode}
              format={format}
              parentId={node.id}
            />
          ))
        )}
        
        {/* Closing tag */}
        <div>
          <code>{closeTag}</code>
        </div>
      </div>
    );
  };

  return format === 'json' ? renderJsonNode() : renderXmlNode();
};

// Canvas component
const StructureCanvas = ({ rootNode, updateNode, deleteNode, addChildNode, moveNode, format }) => {
  const [, drop] = useDrop(() => ({
    accept: [ELEMENT_TYPES.FIELD, ELEMENT_TYPES.CONTAINER],
    drop(item, monitor) {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }

      // Create a new node from the dragged item
      if (item.nodeType) {
        const newNode = {
          id: `${item.id}-${Date.now()}`,
          name: item.fieldName || item.name,
          nodeType: item.nodeType,
          keyName: item.fieldName || item.name,
          dataType: item.type || 'string',
          children: item.nodeType === NODE_TYPES.FIELD ? [] : [],
          value: ''
        };
        
        addChildNode(rootNode.id, newNode);
      }
    },
  }), [rootNode, addChildNode]);

  return (
    <div 
      ref={drop}
      className="border rounded bg-light p-3"
      style={{ minHeight: '600px', width: '100%', overflowY: 'auto' }}
    >
      {rootNode && (
        <CanvasNode 
          node={rootNode} 
          deleteNode={deleteNode}
          updateNode={updateNode}
          addChildNode={addChildNode}
          moveNode={moveNode}
          format={format}
        />
      )}
    </div>
  );
};

// Feed generator component
const FeedGenerator = () => {

    const dispatch = useDispatch();

    const { inventory, organization } = useSelector((state) => state.advertising.schema);

    console.log('inventory', inventory);
    console.log('organization', organization);

  const [activeKey, setActiveKey] = useState('1');
  const [outputFormat, setOutputFormat] = useState('json');
  const [rootNode, setRootNode] = useState({
    id: 'root',
    name: outputFormat === 'json' ? 'root' : 'root',
    nodeType: NODE_TYPES.ROOT,
    keyName: outputFormat === 'json' ? 'root' : 'root',
    children: []
  });
  
  // Available fields for feed
  const availableFields = [
    { id: 'make', fieldName: 'make', type: 'string' },
    { id: 'model', fieldName: 'model', type: 'string' },
    { id: 'variant', fieldName: 'variant', type: 'string' },
    { id: 'mileage', fieldName: 'mileage', type: 'number' },
    { id: 'year', fieldName: 'year', type: 'number' },
    { id: 'price', fieldName: 'price', type: 'currency' },
    { id: 'images', fieldName: 'images', type: 'array' },
    { id: 'features', fieldName: 'features', type: 'array' },
    { id: 'description', fieldName: 'description', type: 'text' },
    { id: 'condition', fieldName: 'condition', type: 'string' },
  ];

  // Available container types for structuring
  const availableContainers = [
    { id: 'vehicleContainer', name: 'vehicle' },
    { id: 'detailsContainer', name: 'details' },
    { id: 'specsContainer', name: 'specifications' },
    { id: 'mediaContainer', name: 'media' },
  ];

  useEffect(() => {
    dispatch(fetchInventorySchema());
  }, []);

  // Update the root node when format changes
  useEffect(() => {    
    setRootNode({
      id: 'root',
      name: outputFormat === 'json' ? 'root' : 'root',
      nodeType: NODE_TYPES.ROOT,
      keyName: outputFormat === 'json' ? 'root' : 'root',
      children: []
    });    
  }, [outputFormat]);

  // Update a node's properties
  const updateNode = useCallback((nodeId, updatedNode) => {
    // Recursive function to update the node in the tree
    const updateNodeInTree = (tree) => {
      if (tree.id === nodeId) {
        return { ...tree, ...updatedNode };
      }
      
      if (tree.children && tree.children.length > 0) {
        return {
          ...tree,
          children: tree.children.map(child => updateNodeInTree(child))
        };
      }
      
      return tree;
    };
    
    setRootNode(prevRootNode => updateNodeInTree(prevRootNode));
  }, []);

  // Delete a node from the tree
  const deleteNode = useCallback((nodeId) => {
    // Recursive function to filter out the node from the tree
    const filterNode = (tree) => {
      return {
        ...tree,
        children: tree.children
          .filter(child => child.id !== nodeId)
          .map(child => filterNode(child))
      };
    };
    
    setRootNode(prevRootNode => filterNode(prevRootNode));
  }, []);

  // Add a child node to a parent node
  const addChildNode = useCallback((parentId, newNode) => {
    // Recursive function to find the parent and add the child
    const addChildToParent = (tree) => {
      if (tree.id === parentId) {
        return {
          ...tree,
          children: [...tree.children, newNode]
        };
      }
      
      if (tree.children && tree.children.length > 0) {
        return {
          ...tree,
          children: tree.children.map(child => addChildToParent(child))
        };
      }
      
      return tree;
    };
    
    setRootNode(prevRootNode => addChildToParent(prevRootNode));
  }, []);

  // Move a node from one parent to another
  const moveNode = useCallback((nodeId, oldParentId, newParentId) => {
    // First, find and extract the node to be moved
    let nodeToMove = null;
    
    // Recursive function to find and extract the node
    const extractNode = (tree) => {
      if (tree.id === oldParentId) {
        const node = tree.children.find(child => child.id === nodeId);
        if (node) {
          nodeToMove = { ...node };
          return {
            ...tree,
            children: tree.children.filter(child => child.id !== nodeId)
          };
        }
      }
      
      if (tree.children && tree.children.length > 0) {
        return {
          ...tree,
          children: tree.children.map(child => extractNode(child))
        };
      }
      
      return tree;
    };
    
    // Then, add the extracted node to the new parent
    const addExtractedNode = (tree) => {
      if (tree.id === newParentId) {
        return {
          ...tree,
          children: [...tree.children, nodeToMove]
        };
      }
      
      if (tree.children && tree.children.length > 0) {
        return {
          ...tree,
          children: tree.children.map(child => addExtractedNode(child))
        };
      }
      
      return tree;
    };
    
    if (oldParentId && newParentId) {
      setRootNode(prevRootNode => {
        const treeWithoutNode = extractNode(prevRootNode);
        return nodeToMove ? addExtractedNode(treeWithoutNode) : treeWithoutNode;
      });
    }
  }, []);

  // Generate the final feed
  const generateFeed = useCallback(() => {
    // Function to convert the node tree to JSON
    const generateJson = (node) => {
      if (node.nodeType === NODE_TYPES.FIELD) {
        return { [node.keyName]: node.value || "" };
      }
      
      if (node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) {
        const childrenObj = {};
        
        node.children.forEach(child => {
          if (child.nodeType === NODE_TYPES.FIELD) {
            childrenObj[child.keyName] = child.value || "";
          } else {
            const nestedObj = generateJson(child);
            Object.assign(childrenObj, nestedObj);
          }
        });
        
        return node.nodeType === NODE_TYPES.ROOT 
          ? childrenObj 
          : { [node.keyName]: childrenObj };
      }
      
      return {};
    };
    
    // Function to convert the node tree to XML
    const generateXml = (node, indent = 0) => {
      const spaces = ' '.repeat(indent);
      let xml = '';
      
      if (node.nodeType === NODE_TYPES.ROOT) {
        xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += `<${node.keyName}>\n`;
        
        node.children.forEach(child => {
          xml += generateXml(child, indent + 2);
        });
        
        xml += `</${node.keyName}>\n`;
      } else if (node.nodeType === NODE_TYPES.CONTAINER) {
        xml += `${spaces}<${node.keyName}>\n`;
        
        node.children.forEach(child => {
          xml += generateXml(child, indent + 2);
        });
        
        xml += `${spaces}</${node.keyName}>\n`;
      } else if (node.nodeType === NODE_TYPES.FIELD) {
        xml += `${spaces}<${node.keyName}>${node.value || ""}</${node.keyName}>\n`;
      }
      
      return xml;
    };
    
    if (outputFormat === 'json') {
      return JSON.stringify(generateJson(rootNode), null, 2);
    } else {
      return generateXml(rootNode);
    }
  }, [rootNode, outputFormat]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Container fluid>
        <Row className="mt-3 h-100" style={{ minHeight: '100vh' }}>
          <Col lg={4} xl={3} className="d-flex flex-column">
            <div className="mb-4 flex-grow-1" style={{ position: "sticky", top: 80 }}>
              <Card className="h-100">
                <Card.Body className="main-content-left">
                  <h5 className="mb-3">Feed Generator</h5>
                  
                  <Accordion activeKey={activeKey} onSelect={setActiveKey} flush>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Field Elements</Accordion.Header>
                      <Accordion.Body>
                        <p className="text-center">Drag fields to the canvas</p>
                        
                        {availableFields.map((field) => (
                          <DraggableFieldItem
                            key={field.id}
                            id={field.id}
                            fieldName={field.fieldName}
                            type={field.type}
                          />
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                    
                    <Accordion.Item eventKey="2">
                      <Accordion.Header>Container Elements</Accordion.Header>
                      <Accordion.Body>
                        <p className="text-center">Drag containers to structure your feed</p>
                        
                        {availableContainers.map((container) => (
                          <DraggableContainerItem
                            key={container.id}
                            id={container.id}
                            name={container.name}
                          />
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                    
                    <Accordion.Item eventKey="3">
                      <Accordion.Header>Output Format</Accordion.Header>
                      <Accordion.Body>
                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="outputFormat"
                              id="json"
                              value="json"
                              checked={outputFormat === 'json'}
                              onChange={() => setOutputFormat('json')}
                            />
                            <label className="form-check-label" htmlFor="json">
                              JSON
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="outputFormat"
                              id="xml"
                              value="xml"
                              checked={outputFormat === 'xml'}
                              onChange={() => setOutputFormat('xml')}
                            />
                            <label className="form-check-label" htmlFor="xml">
                              XML
                            </label>
                          </div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                    
                    <Accordion.Item eventKey="4">
                      <Accordion.Header>Feed Structure</Accordion.Header>
                      <Accordion.Body>
                        <p>
                          {outputFormat === 'json' 
                            ? 'Build your JSON structure by dragging fields and containers to the canvas.' 
                            : 'Build your XML structure by dragging elements to the canvas.'}
                        </p>
                        <p>
                          <strong>Tips:</strong>
                          <ul>
                            <li>Click the edit button (✏️) to customize field names</li>
                            <li>Use container elements to group related fields</li>
                            <li>Drag fields between containers to reorganize</li>
                          </ul>
                        </p>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                  
                  <div className="d-grid gap-2 mt-4">
                    <Button 
                      variant="primary" 
                      className="btn-wave" 
                      onClick={() => {
                        const output = generateFeed();
                        const formattedOutput = document.getElementById('output-preview');
                        if (formattedOutput) {
                          formattedOutput.textContent = output;
                        }
                      }}
                    >
                      Generate Feed
                    </Button>
                  </div>
                  
                  <div className="d-grid gap-2 mt-3">
                    <Button 
                      variant="outline-secondary" 
                      className="btn-wave" 
                      onClick={() => {
                        setRootNode({
                          id: 'root',
                          name: outputFormat === 'json' ? 'root' : 'root',
                          nodeType: NODE_TYPES.ROOT,
                          keyName: outputFormat === 'json' ? 'root' : 'root',
                          children: []
                        });
                      }}
                    >
                      Clear Canvas
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
          
          <Col xl={9} lg={8} className="h-100">
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Structure Canvas</h5>
                  <small className="text-muted">
                    {outputFormat === 'json' 
                      ? 'Build your JSON structure by dragging and nesting elements' 
                      : 'Build your XML structure by dragging and nesting elements'}
                  </small>
                </div>
              </Card.Header>
              <Card.Body>
                <StructureCanvas 
                  rootNode={rootNode}
                  updateNode={updateNode}
                  deleteNode={deleteNode}
                  addChildNode={addChildNode}
                  moveNode={moveNode}
                  format={outputFormat}
                />
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h5 className="mb-0">Output Preview</h5>
              </Card.Header>
              <Card.Body>
                <pre id="output-preview" className="bg-light p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {generateFeed()}
                </pre>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        </Container>
      </DndProvider>   
  );
};

export default FeedGenerator;