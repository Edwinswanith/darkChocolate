
// src/NodeGraph.jsx
import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useLocation } from 'react-router-dom';
import dagre from 'dagre';
import Header from './Header';
import GroupNode from './nodes/GroupNode';
import EditableNode from './nodes/EditableNode';
import PositionLoggerNode from './nodes/PositionLoggerNode';
import StickyNoteNode from './nodes/StickyNoteNode';
import { fetchFunctionalities } from './agents/api'; // Import the API call function

const nodeTypes = {
  editable: EditableNode,
  activity: EditableNode,
  process: EditableNode,
  'position-logger': PositionLoggerNode,
  group: GroupNode,
  stickyNote: StickyNoteNode, // Add the sticky note type
};

const defaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#FF0072',
  },
};

const layoutGraph = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 172, height: 36 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 86,
        y: nodeWithPosition.y - 18,
      },
    };
  });
};

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const sendNodesEdgesToBackend = async (nodes, edges) => {
  try {
    const response = await fetch('http://127.0.0.1:5000/store-nodes-edges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodes, edges }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
};

const appendFunctionalityToBackend = async (node, functionalities) => {
  try {
    const response = await fetch('http://127.0.0.1:5000/append-functionalities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ node, functionalities }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Failed to append functionality:', error);
  }
};

const NodeGraphComponent = () => {
  const location = useLocation();
  const { nodes: initialNodes, edges: initialEdges, prompt: userPrompt, formattedQA } = location.state || { nodes: [], edges: [], prompt: '', formattedQA: '' };
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutGraph(initialNodes.map(node => ({ ...node, type: 'editable' })), initialEdges));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges.map(edge => ({ ...edge, ...defaultEdgeOptions })));
  const [nodeId, setNodeId] = useState(initialNodes.length + 1);
  const [level, setLevel] = useState('1'); // Dropdown state
  const [functionalitiesCache, setFunctionalitiesCache] = useState({});
  const previousLevelRef = useRef(level); // Use a ref to track the previous level
  const reactFlowWrapper = useRef(null);
  const connectingNodeId = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const originalNodesRef = useRef(layoutGraph(initialNodes.map(node => ({ ...node, type: 'editable' })), initialEdges));
  const originalEdgesRef = useRef(initialEdges.map(edge => ({ ...edge, ...defaultEdgeOptions })));

  const addStickyNote = () => {
    const id = `${nodeId}`;
    const newNode = {
      id,
      position: { x: 100, y: 100 }, // You can change the default position
      data: { label: 'This is a sticky note' },
      type: 'stickyNote',
    };

    setNodes((nds) => nds.concat(newNode));
    setNodeId(nodeId + 1);
  };

  const handleStickyNoteChange = (id, newContent) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: newContent } } : node
      )
    );
  };

  const nodeTypes = useMemo(() => ({
    editable: EditableNode,
    activity: EditableNode,
    process: EditableNode,
    'position-logger': PositionLoggerNode,
    group: GroupNode,
    stickyNote: (props) => <StickyNoteNode {...props} onChange={handleStickyNoteChange} />,
  }), []);

  const convertNodesToGroups = async (nodes, edges, userPrompt, formattedQA) => {
    const groupedNodes = [];
    const groupedEdges = [];
    let apiRequestCount = 0;
    const groupNodeSpacing = 400; // Space between group nodes
    const subNodeVerticalSpacing = 80; // Space between sub-nodes
  
    for (const [index, node] of nodes.entries()) {
      console.log('Processing node:', node);
      let functionalities = functionalitiesCache[node.data.label];
  
      if (!functionalities) {
        console.log('Fetching functionalities for:', node.data.label);
        functionalities = await fetchFunctionalities(node.data.label, userPrompt, formattedQA); // Pass formattedQA
        apiRequestCount++;
        if (functionalities.length === 0) {
          console.error(`No functionalities found for ${node.data.label}. Skipping this node.`);
          continue;
        }
        console.log(`Functionalities for ${node.data.label}:`, functionalities);
        setFunctionalitiesCache((prevCache) => ({ ...prevCache, [node.data.label]: functionalities }));
      } else {
        console.log(`Using cached functionalities for ${node.data.label}:`, functionalities);
      }
  
      const groupWidth = 350; // Increased width
      const groupHeight = 70 + functionalities.length * subNodeVerticalSpacing; // Increased height and spacing
      const groupNode = {
        id: node.id,
        data: { label: node.data.label },
        position: { x: index * groupNodeSpacing, y: 100 }, // Adjust horizontal position based on index
        className: 'light group-box',
        style: { backgroundColor: 'rgba(0, 0, 255, 0.2)', width: groupWidth, height: groupHeight },
      };
  
      groupedNodes.push(groupNode);
  
      functionalities.forEach((func, subIndex) => {
        const funcNodeId = `${node.id}-func-${subIndex}`;
        const funcNode = {
          id: funcNodeId,
          data: { label: func },
          position: { x: 10, y: 70 + subIndex * subNodeVerticalSpacing }, // Adjusted position relative to parent
          parentNode: node.id,
          extent: 'parent',
        };
  
        groupedNodes.push(funcNode);
        groupedEdges.push({
          id: `e${groupedEdges.length}-${node.id}`,
          source: node.id,
          target: funcNodeId,
          animated: false,
        });
      });
  
      // Append functionalities to backend
      await appendFunctionalityToBackend(node, functionalities);
  
      // Log to console
      console.log(`Node: ${node.data.label}, Functionalities: ${functionalities}`);
    }
  
    edges.forEach((edge, index) => {
      groupedEdges.push({
        id: `e${index}-${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        animated: true,
        markerEnd: defaultEdgeOptions.markerEnd,
      });
    });
  
    console.log('Grouped Nodes:', groupedNodes);
    console.log('Grouped Edges:', groupedEdges);
    console.log('Total API requests:', apiRequestCount);
  
    return { nodes: groupedNodes, edges: groupedEdges };
  };
  
  
  
  

  useEffect(() => {
    const updateNodesAndEdges = debounce(async () => {
      if (level === '2' && previousLevelRef.current !== '2') {
        previousLevelRef.current = '2'; // Update the previous level
        console.log('Level changed to 2');
        const { nodes: groupedNodes, edges: groupedEdges } = await convertNodesToGroups(originalNodesRef.current, originalEdgesRef.current, userPrompt, formattedQA);
        console.log('Setting nodes and edges for level 2');
        setNodes([]);
        setEdges([]);
        setTimeout(() => {
          setNodes(groupedNodes);
          setEdges(groupedEdges);
        }, 0);
      } else if (level === '1' && previousLevelRef.current !== '1') {
        previousLevelRef.current = '1'; // Update the previous level
        console.log('Setting nodes and edges for level 1');
        setNodes([]);
        setEdges([]);
        setTimeout(() => {
          setNodes(layoutGraph(originalNodesRef.current.map(node => ({ ...node, type: 'editable' })), originalEdgesRef.current));
          setEdges(originalEdgesRef.current);
        }, 0);
      }
    }, 200);

    updateNodesAndEdges();
  }, [level, setNodes, setEdges, userPrompt, functionalitiesCache, formattedQA]);

  const onConnect = useCallback(
    (params) => {
      connectingNodeId.current = null;
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        const id = `${nodeId}`;
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: { label: `Node ${id}` },
          type: 'editable',
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id: `e${eds.length + 1}`, source: connectingNodeId.current, target: id })
        );
        setNodeId(nodeId + 1);
      }
    },
    [nodeId, screenToFlowPosition, setNodes, setEdges]
  );

  return (
    <>
      <Header
        nodes={nodes}
        edges={edges}
        addNode={onConnectEnd}
        saveGraph={() => console.log('Save')}
        loadGraph={() => console.log('Load')}
        level={level}
        setLevel={setLevel}
      />
      <button onClick={addStickyNote}>Add Sticky Note</button>
      <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ height: '90vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </>
  );
};

const NodeGraph = () => (
  <ReactFlowProvider>
    <NodeGraphComponent />
  </ReactFlowProvider>
);

export default NodeGraph;
