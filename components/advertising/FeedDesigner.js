"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Accordion, Form, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventorySchema } from "@/redux/manage/slices/advertising";

// Types of elements
const ELEMENT_TYPES = {
  FIELD: 'field',              // Single field like Make, Model
  CONTAINER: 'container',      // Container element like a root or nested node
};

// Different node types for structure
const NODE_TYPES = {
  ROOT: 'root',            // Root node (like <note> or "cars" object)
  CONTAINER: 'container',  // Container node that can have children
  FIELD: 'field',          // Leaf node (simple value)
  ATTRIBUTE: 'attribute',  // XML attribute
};


// Container form component
const ContainerForm = ({ availableContainers, onAddContainer, onClose }) => {

  const [selectedContainer, setSelectedContainer] = useState('');
  const [keyName, setKeyName] = useState('');

  const handleSelectChange = (e) => {
    setSelectedContainer(e.target.value);
    setKeyName(e.target.value); // Auto-populate keyName with container name
  };

  const handleSubmit = () => {
    if (selectedContainer) {
      onAddContainer(selectedContainer, keyName);
      onClose();
    }
  };

  return (
    <div className="border border-primary rounded p-2 mt-2 mb-1" style={{ backgroundColor: '#e6f7ff', fontSize: '0.9rem' }}>
      <div className="d-flex align-items-center mb-1">
        <InputGroup size="sm" className="mb-1">
          <InputGroup.Text>Container</InputGroup.Text>
          <Form.Select
            size="sm"
            value={selectedContainer}
            onChange={handleSelectChange}
          >
            <option value="">Select a container...</option>
            {availableContainers.map((container) => (
              <option key={container} value={container}>
                {container}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </div>

      <div className="d-flex align-items-center mb-1">
        <InputGroup size="sm" className="mb-1">
          <InputGroup.Text>Key Name</InputGroup.Text>
          <Form.Control
            size="sm"
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Key name"
          />
        </InputGroup>
      </div>

      <div className="d-flex justify-content-end">
        <Button variant="success" size="sm" onClick={handleSubmit} className="me-1 py-0 px-2">Save</Button>
        <Button variant="secondary" size="sm" onClick={onClose} className="py-0 px-2">Cancel</Button>
      </div>
    </div>
  );
};

// Field form component for adding fields to containers
const FieldForm = ({ container, schemaKeys, containerType, onAddField, onClose }) => {
  const [selectedField, setSelectedField] = useState('');
  const [keyName, setKeyName] = useState('');

  const handleSelectChange = (e) => {
    setSelectedField(e.target.value);
    setKeyName(e.target.value); // Auto-populate keyName with field name
  };

  const handleSubmit = () => {
    if (selectedField) {
      onAddField(container, selectedField, keyName);
      onClose();
    }
  };

  // Get available fields from schema for the selected container
  const getFieldsFromSchema = () => {
    // Check if schema is available and has schemaKeys
    if (!schemaKeys) {
      return [];
    }

    // Get container type - either from explicit containerType prop or from container name
    let actualContainerType = containerType || container;

    // If this is an item container, use its parent container type
    if (container === 'item') {
      actualContainerType = containerType || 'inventory';
    }

    // Get the schema data for the container type
    const containerData = schemaKeys[actualContainerType];
    if (!containerData) {
      return [];
    }

    // Handle different schema formats
    if (Array.isArray(containerData)) {
      // If it's an array of field objects
      return containerData
        .filter(field => field && field.id)
        .map(field => field.id)
        .sort();
    } else if (typeof containerData === 'object') {
      // If it's an object with field objects
      return Object.keys(containerData)
        .filter(key => !key.includes('.'))
        .sort();
    }

    return [];
  };

  // Get the fields and sort them alphabetically
  const availableFields = getFieldsFromSchema();
  console.log('Available fields for', container, ':', availableFields);

  return (
    <div className="border border-primary rounded p-2 mt-2 mb-1" style={{ backgroundColor: '#e6f7ff', fontSize: '0.9rem' }}>
      <div className="d-flex align-items-center mb-1">
        <InputGroup size="sm" className="mb-1">
          <InputGroup.Text>Field</InputGroup.Text>
          <Form.Select
            size="sm"
            value={selectedField}
            onChange={handleSelectChange}
          >
            <option value="">Select a field...</option>
            {availableFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </div>

      <div className="d-flex align-items-center mb-1">
        <InputGroup size="sm" className="mb-1">
          <InputGroup.Text>Key Name</InputGroup.Text>
          <Form.Control
            size="sm"
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Key name"
          />
        </InputGroup>
      </div>

      <div className="d-flex justify-content-end">
        <Button variant="success" size="sm" onClick={handleSubmit} className="me-1 py-0 px-2">Save</Button>
        <Button variant="secondary" size="sm" onClick={onClose} className="py-0 px-2">Cancel</Button>
      </div>
    </div>
  );
};

// Move node form component for moving nodes between containers
const MoveNodeForm = ({ node, availableContainers, onMoveNode, onClose }) => {
  const [selectedContainer, setSelectedContainer] = useState('');

  const handleSelectChange = (e) => {
    setSelectedContainer(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedContainer) {
      onMoveNode(node.id, selectedContainer);
      onClose();
    }
  };

  return (
    <div className="border border-warning rounded p-2 mt-2 mb-1" style={{ backgroundColor: '#fffde6', fontSize: '0.9rem' }}>
      <div className="d-flex align-items-center mb-1">
        <InputGroup size="sm" className="mb-1">
          <InputGroup.Text>Target Container</InputGroup.Text>
          <Form.Select
            size="sm"
            value={selectedContainer}
            onChange={handleSelectChange}
          >
            <option value="">Select container...</option>
            {availableContainers.map((container) => (
              <option key={container.id} value={container.id}>
                {container.keyName || container.name}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </div>

      <div className="d-flex justify-content-end">
        <Button variant="warning" size="sm" onClick={handleSubmit} className="me-1 py-0 px-2">Move</Button>
        <Button variant="secondary" size="sm" onClick={onClose} className="py-0 px-2">Cancel</Button>
      </div>
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
  parentId = null,
  schemaKeys,
  onAddField,
  onAddContainer,
  containerNodes,
}) => {
  const nodeRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [editValue, setEditValue] = useState(node.value || '');
  const [editKeyName, setEditKeyName] = useState(node.keyName || node.name);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showContainerForm, setShowContainerForm] = useState(false);
  const [showMoveForm, setShowMoveForm] = useState(false);

  // Determine if this node is an item element
  const isItem = node.keyName === 'item';
  
  // Determine if this node is a static/dependant node that can't be moved
  const isStaticNode = isItem || 
                       node.isArrayItem ||
                       (node.parent && node.parent.isArray) ||
                       node.nodeType === NODE_TYPES.ROOT;

  const handleSaveEdit = () => {
    // For item nodes in XML format, don't allow changing the key name
    const updatedNode = {
      ...node,
      name: editName,
      keyName: isItem && format === 'xml' ? 'item' : editKeyName,
      value: editValue
    };
    
    updateNode(node.id, updatedNode);
    setIsEditing(false);
  };

  let nodeColor = '';
  switch (node.nodeType) {
    case NODE_TYPES.ROOT:
      nodeColor = 'primary';
      break;
    case NODE_TYPES.CONTAINER:
      nodeColor = isItem ? 'warning' : 'info'; // Special color for item nodes
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
          className={`border border-${nodeColor} rounded p-2 mb-2`}
          style={{ 
            marginLeft: `${indent}px`,
            backgroundColor: node.nodeType === NODE_TYPES.ROOT ? '#e6f7ff' : 
                           node.nodeType === NODE_TYPES.CONTAINER ? '#e6fffa' : '#ffffff',
          }}
        >
          <div className="d-flex align-items-center mb-2">
            {node.nodeType !== NODE_TYPES.ROOT && !(isItem && format === 'xml') && (
              <InputGroup className="mb-2">
                <InputGroup.Text>Key Name</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={editKeyName}
                  onChange={(e) => setEditKeyName(e.target.value)}
                  placeholder="Key name"
                  disabled={isItem && format === 'xml'}
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
      // Format value based on data type
      let valueDisplay = '""';

      if (node.value !== undefined && node.value !== null && node.value !== '') {
        // For non-empty values
        if (node.dataType === 'number') {
          valueDisplay = Number(node.value);
        } else if (node.dataType === 'boolean') {
          valueDisplay = node.value === 'true' ? 'true' : 'false';
        } else if (node.dataType === 'array') {
          valueDisplay = '[]';
        } else if (node.dataType === 'object') {
          valueDisplay = '{}';
        } else {
          // Default for strings and other types
          valueDisplay = `"${node.value}"`;
        }
      } else {
        // Empty values based on data type
        if (node.dataType === 'number') {
          valueDisplay = '0';
        } else if (node.dataType === 'boolean') {
          valueDisplay = 'false';
        } else if (node.dataType === 'array') {
          valueDisplay = '[]';
        } else if (node.dataType === 'object') {
          valueDisplay = '{}';
        }
      }

      prefix = `"${node.keyName}": ${valueDisplay},`;
    }

    return (
      <div 
        className={`node-box border-${nodeColor} rounded p-2 mb-1`}
        style={{ 
          marginLeft: `${indent}px`,
          borderLeft: `3px solid var(--bs-${nodeColor})`,
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <code>{prefix}</code>
          <div>
            <Button variant="outline-secondary" size="sm" className="me-1 py-0 px-2" onClick={() => setIsEditing(true)}>✏️</Button>
            
            {/* Only show add buttons if not an item node or if it's a container/root */}
            {(node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) && (!isItem) && (
              <Button
                variant="outline-primary"
                size="sm"
                className="me-1 py-0 px-2"
                onClick={() => setShowFieldForm(true)}
              >
                + Field
              </Button>
            )}
            
            {(node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) && (!isItem) && (
              <Button
                variant="outline-info"
                size="sm"
                className="me-1 py-0 px-2"
                onClick={() => setShowContainerForm(true)}
              >
                + Container
              </Button>
            )}
            
            {/* Add move button only if node can be moved */}
            {!isStaticNode && node.nodeType !== NODE_TYPES.ROOT && (
              <Button
                variant="outline-warning"
                size="sm"
                className="me-1 py-0 px-2"
                onClick={() => setShowMoveForm(true)}
              >
                Move
              </Button>
            )}
            
            {/* Show delete button only if it's not a static node in XML format */}
            {!(isItem && format === 'xml') && node.nodeType !== NODE_TYPES.ROOT && (
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="py-0 px-2" 
                onClick={() => deleteNode(node.id)}
              >
                ×
              </Button>
            )}
          </div>
        </div>
        
        {/* Show field form */}
        {showFieldForm && (
          <FieldForm
            container={node.keyName || 'root'}
            schemaKeys={schemaKeys}
            containerType={node.containerType || node.keyName}
            onAddField={(container, field, keyName) => {
              onAddField(node.id, field, keyName);
              setShowFieldForm(false);
            }}
            onClose={() => setShowFieldForm(false)}
          />
        )}

        {/* Show container form */}
        {showContainerForm && (
          <ContainerForm
            availableContainers={['inventory', 'organization']}
            onAddContainer={(containerName, keyName) => {
              onAddContainer(node.id, containerName, keyName);
              setShowContainerForm(false);
            }}
            onClose={() => setShowContainerForm(false)}
          />
        )}

        {/* Show move form */}
        {showMoveForm && (
          <MoveNodeForm
            node={node}
            availableContainers={containerNodes.filter(container => 
              container.id !== node.id && 
              container.id !== parentId && 
              container.nodeType !== NODE_TYPES.FIELD
            )}
            onMoveNode={(nodeId, newParentId) => {
              moveNode(nodeId, parentId, newParentId);
              setShowMoveForm(false);
            }}
            onClose={() => setShowMoveForm(false)}
          />
        )}
        
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
            schemaKeys={schemaKeys}
            onAddField={onAddField}
            onAddContainer={onAddContainer}
            containerNodes={containerNodes}
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
          className={`border border-${nodeColor} rounded p-2 mb-2`}
          style={{ 
            marginLeft: `${indent}px`,
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
                disabled={isItem} // Disable changing the item tag name
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
        className={`node-box border-${nodeColor} rounded p-2 mb-1`}
        style={{ 
          marginLeft: `${indent}px`,
          borderLeft: `3px solid var(--bs-${nodeColor})`,
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <code>{openTag}</code>
          <div>
            <Button variant="outline-secondary" size="sm" className="me-1 py-0 px-2" onClick={() => setIsEditing(true)}>✏️</Button>
            
            {/* Only show add buttons if not an 'item' node */}
            {(node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) && (!isItem) && (
              <Button
                variant="outline-primary"
                size="sm"
                className="me-1 py-0 px-2"
                onClick={() => setShowFieldForm(true)}
              >
                + Element
              </Button>
            )}
            
            {(node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) && (!isItem) && (
              <Button
                variant="outline-info"
                size="sm"
                className="me-1 py-0 px-2"
                onClick={() => setShowContainerForm(true)}
              >
                + Container
              </Button>
            )}
            
            {/* Add move button only if node can be moved */}
            {!isStaticNode && node.nodeType !== NODE_TYPES.ROOT && (
              <Button
                variant="outline-warning"
                size="sm"
                className="me-1 py-0 px-2"
                onClick={() => setShowMoveForm(true)}
              >
                Move
              </Button>
            )}
            
            {/* Don't show delete button for item nodes in XML format */}
            {!(isItem && format === 'xml') && node.nodeType !== NODE_TYPES.ROOT && (
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="py-0 px-2" 
                onClick={() => deleteNode(node.id)}
              >
                ×
              </Button>
            )}
          </div>
        </div>
        
        {/* Show field form */}
        {showFieldForm && (
          <FieldForm
            container={node.keyName || 'root'}
            schemaKeys={schemaKeys}
            containerType={node.containerType || node.keyName}
            onAddField={(container, field, keyName) => {
              onAddField(node.id, field, keyName);
              setShowFieldForm(false);
            }}
            onClose={() => setShowFieldForm(false)}
          />
        )}

        {/* Show container form */}
        {showContainerForm && (
          <ContainerForm
            availableContainers={['inventory', 'organization']}
            onAddContainer={(containerName, keyName) => {
              onAddContainer(node.id, containerName, keyName);
              setShowContainerForm(false);
            }}
            onClose={() => setShowContainerForm(false)}
          />
        )}

        {/* Show move form */}
        {showMoveForm && (
          <MoveNodeForm
            node={node}
            availableContainers={containerNodes.filter(container => 
              container.id !== node.id && 
              container.id !== parentId && 
              container.nodeType !== NODE_TYPES.FIELD
            )}
            onMoveNode={(nodeId, newParentId) => {
              moveNode(nodeId, parentId, newParentId);
              setShowMoveForm(false);
            }}
            onClose={() => setShowMoveForm(false)}
          />
        )}
        
        {/* Render content or children */}
        {node.nodeType === NODE_TYPES.FIELD && !node.children.length ? (
          <div style={{ marginLeft: 20 }}>
            <code>
              {(() => {
                // Format value based on data type
                if (!node.value && node.value !== 0) {
                  // Show appropriate empty value based on data type
                  switch (node.dataType) {
                    case 'array':
                      return '[]';
                    case 'object':
                      return '{}';
                    case 'number':
                      return '0';
                    case 'boolean':
                      return 'false';
                    default:
                      return '';
                  }
                } else {
                  // For non-empty values
                  return node.value;
                }
              })()}
            </code>
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
              schemaKeys={schemaKeys}
              onAddField={onAddField}
              onAddContainer={onAddContainer}
              containerNodes={containerNodes}
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
const StructureCanvas = ({ 
  rootNode, 
  updateNode, 
  deleteNode, 
  addChildNode, 
  moveNode, 
  format,
  schemaKeys,
  onAddField,
  onAddContainer,
  containerNodes
}) => {
  return (
    <div 
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
          schemaKeys={schemaKeys}
          onAddField={onAddField}
          onAddContainer={onAddContainer}
          containerNodes={containerNodes}
        />
      )}
    </div>
  );
};

// Feed generator component
const FeedGenerator = () => {

  const dispatch = useDispatch();
  const schemaData = useSelector((state) => state.advertising.schema);
  const [outputFormat, setOutputFormat] = useState('json');
  const [schemaKeys, setSchemaKeys] = useState(null);
  const [containerNodes, setContainerNodes] = useState([]);
  
  const [rootNode, setRootNode] = useState({
    id: 'root',
    name: outputFormat === 'json' ? 'root' : 'root',
    nodeType: NODE_TYPES.ROOT,
    keyName: outputFormat === 'json' ? 'root' : 'root',
    children: []
  });

  // Load schema data when component mounts
  useEffect(() => {
    dispatch(fetchInventorySchema());
  }, [dispatch]);

  // Process schema data when it changes
  useEffect(() => {
    if (schemaData) {
      // Extract schema keys for inventory and organization directly from the response
      const { inventory, organization } = schemaData;

      if (inventory || organization) {
        // Log the structure for debugging
        console.log('Inventory structure:', Array.isArray(inventory) ? 'array' : typeof inventory);
        console.log('Organization structure:', Array.isArray(organization) ? 'array' : typeof organization);

        // Create keys object with inventory and organization data
        const keys = {
          inventory: inventory || {},
          organization: organization || {}
        };

        setSchemaKeys(keys);
        console.log('Schema keys set:', keys);
      }
    }
  }, [schemaData]);

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

  // Update container nodes list when rootNode changes
  useEffect(() => {
    // Function to collect all container nodes
    const collectContainerNodes = (node, list = []) => {
      if (node.nodeType === NODE_TYPES.ROOT || node.nodeType === NODE_TYPES.CONTAINER) {
        list.push({
          id: node.id,
          name: node.name,
          keyName: node.keyName,
          nodeType: node.nodeType,
          isArray: node.isArray,
          containerType: node.containerType
        });
      }
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => collectContainerNodes(child, list));
      }
      
      return list;
    };
    
    const containers = collectContainerNodes(rootNode);
    setContainerNodes(containers);
  }, [rootNode]);

  // Reset the feed structure
  const resetFeed = () => {
    setRootNode({
      id: 'root',
      name: outputFormat === 'json' ? 'root' : 'root',
      nodeType: NODE_TYPES.ROOT,
      keyName: outputFormat === 'json' ? 'root' : 'root',
      children: []
    });
  };

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
        // If node already has a parent reference, use it
        // Otherwise, create a parent reference using the current parent node
        const nodeWithParentRef = newNode.parent
          ? { ...newNode }
          : {
              ...newNode,
              parent: {
                id: tree.id,
                isArray: tree.isArray,
                isArrayItem: tree.isArrayItem,
                containerType: tree.containerType
              }
            };

        // For array containers where the child is not an item, make sure it's added to an item
        if (tree.isArray && tree.nodeType === NODE_TYPES.CONTAINER &&
            !newNode.id.startsWith('item-') &&
            nodeWithParentRef.nodeType === NODE_TYPES.FIELD) {

          // Find or create an item child
          let itemChild = tree.children.find(child =>
            child.nodeType === NODE_TYPES.CONTAINER && child.keyName === 'item');

          if (itemChild) {
            // Update the node's parent reference to point to the item
            nodeWithParentRef.parent = {
              id: itemChild.id,
              isArray: false,
              isArrayItem: true,
              containerType: tree.containerType
            };

            // Return with the field added to the item instead
            return {
              ...tree,
              children: tree.children.map(child =>
                child.id === itemChild.id
                  ? { ...child, children: [...child.children, nodeWithParentRef] }
                  : child
              )
            };
          }
        }

        return {
          ...tree,
          children: [...tree.children, nodeWithParentRef]
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
          // Create a deep copy to avoid reference issues
          nodeToMove = JSON.parse(JSON.stringify(node));

          // Update the parent reference
          nodeToMove.parent = {
            id: newParentId
          };

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

    // Find detailed parent info for the target container
    const findParentInfo = (tree, targetId) => {
      if (tree.id === targetId) {
        return {
          id: tree.id,
          isArray: tree.isArray,
          containerType: tree.containerType
        };
      }

      if (tree.children) {
        for (const child of tree.children) {
          const result = findParentInfo(child, targetId);
          if (result) return result;
        }
      }

      return null;
    };

    // Then, add the extracted node to the new parent
    const addExtractedNode = (tree, parentInfo) => {
      if (tree.id === newParentId) {
        // Update the node's parent reference
        if (nodeToMove) {
          nodeToMove.parent = parentInfo;
        }

        return {
          ...tree,
          children: [...tree.children, nodeToMove]
        };
      }

      if (tree.children && tree.children.length > 0) {
        return {
          ...tree,
          children: tree.children.map(child => addExtractedNode(child, parentInfo))
        };
      }

      return tree;
    };

    if (oldParentId && newParentId) {
      setRootNode(prevRootNode => {
        // Get detailed parent info
        const parentInfo = findParentInfo(prevRootNode, newParentId) || {
          id: newParentId
        };

        // Extract the node from its current location
        const treeWithoutNode = extractNode(prevRootNode);

        // Only proceed if we found and extracted the node
        return nodeToMove ? addExtractedNode(treeWithoutNode, parentInfo) : treeWithoutNode;
      });
    }
  }, []);

  // Handle adding a container from schema
  const handleAddContainer = (parentId, containerName, keyName) => {

    if (!parentId) return;

    // Determine if this container should be treated as an array
    // Check array types based on schema structure or format
    let isArray = false;

    // For XML or if schema shows array type, mark it as array
    if (outputFormat === 'xml' ||
        (schemaKeys && schemaKeys[containerName] && Array.isArray(schemaKeys[containerName]))) {
      isArray = true;
    }

    const containerId = `container-${Date.now()}`;

    // Find parent information to pass along
    const findParentInfo = (nodeId, tree = rootNode) => {
      if (tree.id === nodeId) {
        return {
          id: tree.id,
          isArray: tree.isArray,
          containerType: tree.containerType || tree.keyName
        };
      }

      if (tree.children) {
        for (const child of tree.children) {
          const result = findParentInfo(nodeId, child);
          if (result) return result;
        }
      }

      return { id: nodeId };
    };

    const parentInfo = findParentInfo(parentId);

    // Check if parent is an item element - important for proper nesting
    const isParentItem = parentInfo && parentInfo.isArrayItem;

    const newNode = {
      id: containerId,
      name: containerName,
      keyName: keyName,
      nodeType: NODE_TYPES.CONTAINER,
      children: [],
      isArray,
      containerType: containerName, // Store which schema container this represents
      parent: parentInfo
    };

    // Add the container node
    addChildNode(parentId, newNode);

    // For array containers, add item node automatically with a small delay
    if (isArray) {
      setTimeout(() => {
        const itemNode = {
          id: `item-${Date.now()}`,
          name: 'item',
          keyName: 'item',
          nodeType: NODE_TYPES.CONTAINER,
          children: [],
          isArrayItem: true,
          containerType: containerName, // Store parent container type for reference
          parent: { id: containerId, isArray: true, containerType: containerName } // Reference to parent for dependency tracking
        };

        // Add the item to the container
        addChildNode(containerId, itemNode);
      }, 100); // Small delay to ensure parent is added first
    }
  };

  // Check if a container is already added to the canvas
  const isContainerAdded = (containerName) => {
    const checkNode = (node) => {
      if (node.keyName === containerName && node.nodeType === NODE_TYPES.CONTAINER) {
        return true;
      }

      for (const child of node.children) {
        if (checkNode(child)) {
          return true;
        }
      }

      return false;
    };

    return checkNode(rootNode);
  };

  // Add a field from the schema to a container
  const addFieldToContainer = (parentId, fieldName, keyName) => {
    if (!parentId) return;

    // Find the parent node to get its container type
    let parentNode = null;

    const findParent = (node) => {
      if (node.id === parentId) {
        parentNode = node;
        return true;
      }

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (findParent(child)) {
            return true;
          }
        }
      }

      return false;
    };

    findParent(rootNode);

    if (!parentNode) {
      console.error("Parent node not found:", parentId);
      return;
    }

    // Determine the actual container type
    let containerType = parentNode.containerType;

    // If parent is an item, use the container type of its parent
    if (parentNode.keyName === 'item' && parentNode.isArrayItem && parentNode.parent) {
      containerType = parentNode.parent.containerType;
    }

    // If still no container type, use parent's keyName as a fallback
    if (!containerType) {
      containerType = parentNode.keyName;
    }

    let dataType = 'string';

    // If we have schema data and the container type, try to get the data type for this field
    if (schemaKeys && containerType && schemaKeys[containerType]) {
      const containerData = schemaKeys[containerType];

      // Find the field and get its type
      if (Array.isArray(containerData)) {
        // For array schema format
        const field = containerData.find(f => f && f.id === fieldName);
        if (field && field.type) {
          dataType = field.type;
        }
      } else if (typeof containerData === 'object') {
        // For object schema format
        const field = containerData[fieldName];
        if (field && field.type) {
          dataType = field.type;
        }
      }
    }

    // Create the new field node with proper parent reference
    const newNode = {
      id: `field-${Date.now()}`,
      name: fieldName,
      keyName: keyName,
      nodeType: NODE_TYPES.FIELD,
      dataType,
      children: [],
      value: '',
      parent: {
        id: parentId,
        isArray: parentNode.isArray,
        isArrayItem: parentNode.isArrayItem,
        containerType: containerType
      },
      containerType: containerType // Link back to source schema
    };

    addChildNode(parentId, newNode);
  };

  // Generate the final feed
  const generateFeed = useCallback(() => {
    // Function to convert the node tree to JSON
    const generateJson = (node) => {
      if (node.nodeType === NODE_TYPES.FIELD) {
        let value = node.value;
        // Format value based on data type if available
        if (node.dataType === 'number' && node.value) {
          value = Number(node.value);
        } else if (node.dataType === 'boolean' && node.value) {
          value = node.value === 'true';
        } else {
          value = node.value || "";
        }
        return { [node.keyName]: value };
      }

      if (node.nodeType === NODE_TYPES.CONTAINER || node.nodeType === NODE_TYPES.ROOT) {
        // Special handling for array items
        if (node.isArray) {
          // Find all item children
          const itemNodes = node.children.filter(child =>
            child.keyName === 'item' || child.isArrayItem);

          if (itemNodes.length > 0) {
            // For each item, generate its contents as an object
            const itemsArray = itemNodes.map(item => {
              const itemObj = {};

              // Process the item's fields
              item.children.forEach(field => {
                if (field.nodeType === NODE_TYPES.FIELD) {
                  let value = field.value;
                  if (field.dataType === 'number' && field.value) {
                    value = Number(field.value);
                  } else if (field.dataType === 'boolean' && field.value) {
                    value = field.value === 'true';
                  } else {
                    value = field.value || "";
                  }
                  itemObj[field.keyName] = value;
                } else if (field.nodeType === NODE_TYPES.CONTAINER) {
                  const nestedObj = generateJson(field);
                  Object.assign(itemObj, nestedObj);
                }
              });

              return itemObj;
            });

            return { [node.keyName]: itemsArray };
          }
        }

        // Standard object handling for non-array containers
        const childrenObj = {};

        node.children.forEach(child => {
          // Skip item nodes when processing directly (they're handled above)
          if (child.keyName === 'item' || child.isArrayItem) {
            return;
          }

          if (child.nodeType === NODE_TYPES.FIELD) {
            let value = child.value;
            if (child.dataType === 'number' && child.value) {
              value = Number(child.value);
            } else if (child.dataType === 'boolean' && child.value) {
              value = child.value === 'true';
            } else {
              value = child.value || "";
            }
            childrenObj[child.keyName] = value;
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
        // Format value for XML
        let value = node.value || "";

        // For XML output, ensure special characters are properly encoded
        value = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

        xml += `${spaces}<${node.keyName}>${value}</${node.keyName}>\n`;
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
    <Container fluid>
      <Row className="mt-3 mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Form.Select
                className="d-inline-block"
                style={{ width: '150px' }}
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
              >
                <option value="json">JSON Format</option>
                <option value="xml">XML Format</option>
              </Form.Select>
            </div>
            <div>
              <Button variant="success" className="me-2" onClick={() => generateFeed()}>
                Generate Feed
              </Button>
              <Button variant="danger" onClick={resetFeed}>
                Reset
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mt-3 h-100" style={{ minHeight: '100vh' }}>
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Structure Canvas</h5>
              <small className="text-muted">
                {outputFormat === 'json'
                  ? 'Build your JSON structure by adding elements with buttons'
                  : 'Build your XML structure by adding elements with buttons'}
              </small>
              {outputFormat === 'xml' && (
                <div className="mt-1 text-info small">
                  <strong>Note:</strong> In XML format, 'item' elements are automatically added to array containers 
                  and cannot be moved or deleted.
                </div>
              )}
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
              schemaKeys={schemaKeys}
              onAddField={addFieldToContainer}
              onAddContainer={handleAddContainer}
              containerNodes={containerNodes}
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
      </Row>
    </Container>  
  );
};

export default FeedGenerator;