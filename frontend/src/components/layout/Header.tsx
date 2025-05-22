import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-ucla-blue text-white shadow-lg">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">🐻</div>
            <div>
              <h1 className="text-xl font-bold">NutriBruin</h1>
              <p className="text-xs text-ucla-gold">UCLA Dining Enhanced</p>
            </div>
          </Link>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link 
                  to="/" 
                  className="hover:text-ucla-gold transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/restaurants" 
                  className="hover:text-ucla-gold transition-colors"
                >
                  Dining Halls
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="hover:text-ucla-gold transition-colors"
                >
                  Login
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;