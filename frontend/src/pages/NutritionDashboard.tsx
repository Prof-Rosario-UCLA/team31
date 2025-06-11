import React from 'react';
import './NutritionDashboard.css';
import { diningHalls } from "../data/diningHalls";
import { Location } from "../types/models";

const NutritionDashboard: React.FC = () => {

  const [wasm, setWasm] = React.useState<any>(null);
  const [userLocation, setUserLocation] = React.useState<Location | null>(null);

  React.useEffect(() => {
    const loadWasm = async()=>{
      const response = await fetch("/formulae.wasm");
      const buffer = await response.arrayBuffer();
      const {instance} = await WebAssembly.instantiate(buffer);
      setWasm(instance.exports);
    };
  
    loadWasm();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      );
    }


  }, []);

  const getDistanceAndCalories = (coords: Location): [string, string] => {
    //if offline
    if (!wasm || !userLocation) {
      return ["Loading...", "Loading"];
    }
  
    //use the wasm module
    const distance = wasm.haversine(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
    const calories = wasm.caloriesBurned(distance);
    return [`${distance.toFixed(2)} mi`, `${Math.round(calories)} calories burned`];
  };

  const colors = ["darkblue", "blue", "lightblue"];

  const getCardColor = (index: number) => {
    return index < 3 ? colors[index] : "gray";
  };
  
  const getMedal = (index: number) => {
    return index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;
  };

  const sortedHalls = [...diningHalls]
  .map(h => ({...h, distance: (!wasm || !userLocation)
      ? Infinity
      : wasm.haversine(userLocation.lat, userLocation.lng, h.coords.lat, h.coords.lng)
  }))
  .sort((a, b) => b.distance - a.distance);

  return (
    <div className="phone-sim">
      <section className="title">
        <h1 className="apptitle">NutriBruin</h1>
        <h2 className="goal-center">Goal:</h2>
        <form action="#" method="GET" className="goal-center">
          <select id="goal" name="goal">
            <option value="cutting">Cutting</option>
            <option value="bulking">Bulking</option>
            <option value="volume">Volume</option>
          </select>
          <button type="submit">Submit</button>
        </form>

        <div className="formula-container center">
          <div className="formula-block">
            <b>Cutting:</b><br />
            10 * Protein / Calories<br />
            (1.0+ ideal)
          </div>
          <div className="divider"></div>
          <div className="formula-block">
            <b>Bulking:</b><br />
            Cals / Serving Weight<br />
            (Largest ideal)
          </div>
          <div className="divider"></div>
          <div className="formula-block">
            <b>Volume:</b><br />
            Calories / Serving Weight<br />
            (Smallest ideal)
          </div>
        </div>
      </section>

      <br />

      <section className="restaurants" role="region" aria-label="Recommended Restaurants for selected goal">
        <h3>Top Recommended Restaurants For: Cutting</h3>
        <div className="scroll-box">
          {sortedHalls.map((hall, idx) => {const [dist, cal] = getDistanceAndCalories(hall.coords);
          
          return (
            <div className={`restaurant-card ${getCardColor(idx)}`} key={hall.id}>
              <div>
                {getMedal(idx) && <span aria-hidden="true">{getMedal(idx)}</span>} {hall.name} - XXX items - Avg P/C: {hall.avgPC.toFixed(2)}
              </div>
              <div>
                {dist} ~ <em>{cal}</em>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      <section className="foods" role="region" aria-label="Top Foods for selected goal">
        <h3>Today's Top Protein Foods</h3>
        <div className="top-foods-list scroll-box">
          <div className="food-card darkblue">
            <div>
              <span aria-hidden="true">🥇</span> <b>Chicken Breast</b> - <em>BPlate</em>
            </div>
            <div>P/C: 1.0 - 180 Calories, 18g Protein</div>
          </div>
          <div className="food-card blue">
            <div>
              <span aria-hidden="true">🥈</span> <b>Grilled Steak</b> - <em>BPlate</em>
            </div>
            <div>P/C: 0.9 - 200 Calories, 18g Protein</div>
          </div>
          <div className="food-card lightblue">
            <div>
              <span aria-hidden="true">🥉</span> <b>Scrambled Eggs</b> - <em>De Neve</em>
            </div>
            <div>P/C: 0.6 - 91 Calories, 6g Protein</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NutritionDashboard;