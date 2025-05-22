import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-ucla-dark-blue text-white mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">NutriBruin</h3>
            <p className="text-gray-300">
              Enhancing UCLA dining with comprehensive nutritional insights and personalized recommendations.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/restaurants" className="hover:text-ucla-gold transition-colors">Dining Halls</a></li>
              <li><a href="/menu" className="hover:text-ucla-gold transition-colors">Today's Menu</a></li>
              <li><a href="/nutrition" className="hover:text-ucla-gold transition-colors">Nutrition Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">CS144 Project</h3>
            <p className="text-gray-300 text-sm">
              Created by Ryan Phua & Andre Mai<br/>
              UCLA Computer Science<br/>
              Web Applications Final Project
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 NutriBruin. Built for CS144 at UCLA.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;