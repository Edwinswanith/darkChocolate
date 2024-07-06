import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';

const EditableNode = ({ data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const handleDoubleClick = (event) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setLabel(event.target.value);
    data.label = event.target.value;
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div onDoubleClick={handleDoubleClick} style={{ padding: 10, border: '1px solid black', borderRadius: 5, backgroundColor: 'white' }}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ border: 'none', backgroundColor: 'transparent', textAlign: 'center', width: '100%' }}
        />
      ) : (
        <div style={{ textAlign: 'center' }}>{label}</div>
      )}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

export default EditableNode;
