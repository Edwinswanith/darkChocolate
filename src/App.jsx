import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Initial from './agents/initial';
import PromptInput from './agents/PromptInput';
import NodeGraph from './NodeGraph'; // Ensure you have this component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Initial />} />
        <Route path="/promptinput" element={<PromptInput />} />
        <Route path="/display" element={<NodeGraph />} />
      </Routes>
    </Router>
  );
}

export default App;
