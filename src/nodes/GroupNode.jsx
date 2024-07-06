import React from 'react';

const GroupNode = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid black', borderRadius: 5, backgroundColor: 'rgba(0, 0, 255, 0.2)', width: '100%', height: '100%' }}>
      {data.label}
    </div>
  );
};

export default GroupNode;
