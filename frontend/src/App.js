import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Register from './Register';
import Dashboard from './Dashboard';
import Login from './Login';
import Home from './Home';
import Check from './check';
import Predict from './Predict';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/check" element={<Check />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
      </Routes>
    </HashRouter>
  );
}

export default App;
