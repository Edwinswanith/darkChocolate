import React, { memo, useState } from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const StickyNoteNode = ({ data, id, selected, onClick, onDoubleClick, onChange }) => {
  const [content, setContent] = useState(data.label);
  const [size, setSize] = useState({ width: 200, height: 150 });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (event) => {
    const newContent = event.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent, id);
    }
  };

  const handleResize = (event, { size }) => {
    setSize(size);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const styles = {
    borderRadius: '15px',
    backgroundColor: 'yellow',
    boxShadow: selected ? '0 0 10px rgba(0, 0, 0, 0.5)' : '2px 2px 5px rgba(0, 0, 0, 0.2)',
    fontSize: '14px',
    color: 'black',
    padding: '10px',
    position: 'relative',
    border: selected ? '2px solid blue' : 'none',
    width: size.width,
    height: size.height,
  };

  return (
    <ResizableBox
      width={size.width}
      height={size.height}
      minConstraints={[100, 50]}
      maxConstraints={[900, 900]}
      onResize={handleResize}
      style={styles}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      <textarea
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'none',
          resize: 'none',
          outline: 'none',
          overflow: 'hidden',
          display: isEditing ? 'block' : 'none',
        }}
      />
      {!isEditing && (
        <div style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
          {content}
        </div>
      )}
      <div style={{ position: 'absolute', top: 0, right: 0, padding: '2px 5px', background: 'white', borderRadius: '3px' }}>
        {data.number}
      </div>
    </ResizableBox>
  );
};

export default memo(StickyNoteNode);
