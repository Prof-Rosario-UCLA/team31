import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NutritionDashboard from './pages/NutritionDashboard';
import CookieBanner from './components/common/CookieBanner';

function App() {
  return (
    <Router>
      <CookieBanner />
      <Routes>
        <Route path="/" element={<NutritionDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;