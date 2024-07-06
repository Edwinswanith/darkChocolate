import React, { useCallback } from 'react';
import logo from './images/logo_bizzzup.png';

const Header = ({ nodes, edges, setNodes, setEdges, nodeId, setNodeId, level, setLevel }) => {
  const handleLoadButtonClick = () => {
    document.getElementById('load-graph').click();
  };

  const addNode = useCallback(() => {
    const newNodeType = 'editable';
    const newNode = {
      id: `${nodeId}`,
      type: newNodeType,
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: { label: `New Node ${nodeId}` },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeId(nodeId + 1);
  }, [nodeId, setNodes, setNodeId]);

  // const saveGraph = useCallback(() => {
  //   const graphData = {
  //     nodes: nodes,
  //     edges: edges,
  //   };
  //   const json = JSON.stringify(graphData, null, 2);
  //   const blob = new Blob([json], { type: 'application/json' });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'graph.json';
  //   a.click();
  //   URL.revokeObjectURL(url);
  // }, [nodes, edges]);
  const saveGraph = useCallback(() => {
    const graphData = {
      nodes: nodes,
      edges: edges,
    };
    const json = JSON.stringify(graphData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);


  const loadGraph = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const graphData = JSON.parse(e.target.result);
        console.log('Loaded graph data:', graphData);
        setNodes(graphData.nodes || []);
        setEdges(graphData.edges || []);
      };
      reader.readAsText(file);
    }
  }, [setNodes, setEdges]);

  const logGraphData = () => {
    const graphData = {
      nodes: nodes,
      edges: edges,
    };
    console.log('Graph Data:', JSON.stringify(graphData, null, 2));
  };

  return (
    <header style={styles.header}>
      <img src={logo} alt="Logo" style={styles.logo} />
      <div style={styles.controls}>
        <button className="header-button" onClick={addNode} style={styles.button}>Add Node</button>
        <button className="header-button" onClick={saveGraph} style={styles.button}>Save</button>
        <button className="header-button" onClick={handleLoadButtonClick} style={styles.button}>Load</button>
        <input type="file" onChange={loadGraph} style={styles.fileInput} id="load-graph" />
        <button className="header-button" onClick={logGraphData} style={styles.button}>Log Data</button>
        <select
          id="level-select"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          style={styles.select}
        >
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
        </select>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 10px',
    // backgroundColor: '#1E90FF',
    color:"white",
    borderBottom: '1px solid #ddd',
  },
  logo: {
    height: '30px',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    marginLeft: '10px',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    marginLeft: '10px',
    padding: '5px 10px',
    backgroundColor: '#4682B4',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  fileInput: {
    display: 'none',
  },
};

export default Header;
