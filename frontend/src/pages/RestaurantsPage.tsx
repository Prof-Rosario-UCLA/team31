import React from 'react';

const RestaurantsPage: React.FC = () => {
  const diningHalls = [
    {
      id: 1,
      name: "De Neve",
      location: "De Neve Plaza",
      status: "Open",
      hours: "7:00 AM - 10:00 PM",
      distance: "0.3 miles",
    },
    {
      id: 2,
      name: "Covel",
      location: "Covel Commons",
      status: "Open",
      hours: "7:00 AM - 10:00 PM",
      distance: "0.5 miles",
    },
    {
      id: 3,
      name: "Epicuria",
      location: "Ackerman Union",
      status: "Closed",
      hours: "11:00 AM - 8:00 PM",
      distance: "0.7 miles",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">UCLA Dining Halls</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover what's available at UCLA's dining locations. View menus, nutrition information, 
          and get personalized recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diningHalls.map((hall) => (
          <div key={hall.id} className="card hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{hall.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                hall.status === 'Open' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {hall.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                {hall.location}
              </div>
              <div className="flex items-center">
                <span className="mr-2">🕒</span>
                {hall.hours}
              </div>
              <div className="flex items-center">
                <span className="mr-2">🚶</span>
                {hall.distance}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="flex-1 btn-primary text-sm py-2">
                View Menu
              </button>
              <button className="flex-1 btn-secondary text-sm py-2">
                Get Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantsPage;