import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-ucla-blue">NutriBruin</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover enhanced nutritional insights for UCLA dining. Get personalized recommendations, 
          detailed nutrition information, and find nearby dining halls with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/restaurants" className="btn-primary">
            Explore Dining Halls
          </Link>
          <Link to="/login" className="btn-secondary">
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold mb-3">Real-time Menus</h3>
          <p className="text-gray-600">
            Access up-to-date menu information from all UCLA dining halls with detailed nutritional data.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-3">AI Recommendations</h3>
          <p className="text-gray-600">
            Get personalized meal suggestions based on your dietary preferences and nutritional goals.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="text-xl font-semibold mb-3">Location-based</h3>
          <p className="text-gray-600">
            Find dining halls near you with walking directions and real-time availability.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-ucla-blue text-white rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-ucla-gold">11</div>
            <div className="text-sm">Dining Locations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-ucla-gold">500+</div>
            <div className="text-sm">Menu Items</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-ucla-gold">24/7</div>
            <div className="text-sm">Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-ucla-gold">🥇</div>
            <div className="text-sm">UCLA Pride</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;