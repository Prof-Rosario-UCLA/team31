import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NutritionDashboard from './pages/NutritionDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NutritionDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;