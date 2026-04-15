import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvestigationHub from './pages/InvestigationHub';
import NarrativeEditor from './pages/NarrativeEditor';
import AiGeneration from './pages/AiGeneration';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/investigation" element={<InvestigationHub />} />
        <Route path="/narrative" element={<NarrativeEditor />} />
        <Route path="/generating" element={<AiGeneration />} />
        <Route path="/alerts" element={<ComingSoon />} />
        <Route path="/archive" element={<ComingSoon />} />
        <Route path="/compliance" element={<ComingSoon />} />
        <Route path="/risk" element={<ComingSoon />} />
      </Routes>
    </Router>
  );
}

export default App;
