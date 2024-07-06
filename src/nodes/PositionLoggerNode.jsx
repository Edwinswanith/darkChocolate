import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

const PositionLoggerNode = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label);
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setLabel(event.target.value);
    data.label = event.target.value;
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div onDoubleClick={handleDoubleClick} style={{ padding: 10, border: '1px solid black', borderRadius: 5, backgroundColor: 'white' }}>
      {isEditing ? (
        <input
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

export default PositionLoggerNode;
