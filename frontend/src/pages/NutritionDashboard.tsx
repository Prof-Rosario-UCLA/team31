import React from 'react';
import './NutritionDashboard.css';
import { diningHalls } from "../data/diningHalls";
import { Location } from "../types/models";
import { Food } from "../types/models";

const MAX_FOOD_DISPLAY = 50;

const NutritionDashboard: React.FC = () => {

  const [wasm, setWasm] = React.useState<any>(null);
  const [userLocation, setUserLocation] = React.useState<Location | null>(null);
  const [goal, setGoal] = React.useState("cutting");

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

  /// OLD SORT JUST FOR PLACEHOLDER REAL SORTER BELOW ///
  // const sortedHalls = [...diningHalls]
  // .map(h => ({...h, distance: (!wasm || !userLocation)
  //     ? Infinity : wasm.haversine(userLocation.lat, userLocation.lng, h.coords.lat, h.coords.lng)
  // }))
  // .sort((a, b) => b.distance - a.distance);

  /// REAL SORTER WITH ACTUAL LOGIC FOR ALL 3 CRITERIA ///
  const sortHalls = () => {
    return [...diningHalls].sort((a, b) => {
      ///CUTTING LOGIC
      if (goal === "cutting") {
        //sort by numer of high P/C foods
        const countHighPC = (hall: typeof a) =>
          hall.allFoods.filter(f => f.protein / f.calories >= 1).length;
  
        return countHighPC(b) - countHighPC(a);
      }
  
      //BULKING LOGIC
      if (goal === "bulking") {
        //sort by food with the highest calories per gram
        const maxCalsPerGram = (hall: typeof a) =>
          hall.allFoods.reduce(
            (max, f) => Math.max(max, f.calories / f.servingSize || 1),
            0
          );
        return maxCalsPerGram(b) - maxCalsPerGram(a);
      }
  
      //VOLUME LOGIC
      if (goal === "volume") {
        //sort by the halls by the food that has the smallest ratio of calories / gram
        const minCals = (hall: typeof a) =>
          hall.allFoods.reduce((min, f) => Math.min(min, f.calories / f.servingSize), Infinity);
  
        return minCals(a) - minCals(b);
      }
  
      return 0;
    });
  };

  //BEST FOODS SORTING LOGIC
  const sortFoods = () => {
    const allFoods: Food[] = [];

    for (let i = 0; i < diningHalls.length; i++) {
      const hall = diningHalls[i];
      for (let j = 0; j < hall.allFoods.length; j++) {
        allFoods.push(hall.allFoods[j]);
      }
    }
    
    //goal logic
    if (goal === "cutting") {
      //sort by highest ratio of protein/calories
      allFoods.sort((a, b) => (b.protein / b.calories) - (a.protein / a.calories));
    } else if (goal === "bulking") {
      //sort by highest reatio of calories / serving
      allFoods.sort((a, b) => (b.calories / b.servingSize) - (a.calories / a.servingSize));
    } else if (goal === "volume") {
      //sort by lowest ratio of calories / serving
      allFoods.sort((a, b) => (a.calories / a.servingSize) - (b.calories / b.servingSize));
    }
  
    return allFoods;
  };

  return (
    <div className="phone-sim">
      <section className="title">
        <h1 className="apptitle">NutriBruin</h1>
        <h2 className="goal-center">Goal:</h2>
        <form action="#" method="GET" className="goal-center">
          <select id="goal" name="goal" value={goal} onChange={(e) => setGoal(e.target.value)}>
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
        <h3>
          Top Recommended Restaurants For:{" "}
          {goal === "cutting" && "Cutting"}
          {goal === "bulking" && "Bulking"}
          {goal === "volume" && "Volume"}
        </h3>
        <div className="scroll-box">
          {sortHalls().map((hall, idx) => {const [dist, cal] = getDistanceAndCalories(hall.coords);
          
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
        <h3>
          {goal === "cutting" && "Today's Top Protein Foods"}
          {goal === "bulking" && "Today's Top Caloric Foods"}
          {goal === "volume" && "Today's Top Volume Foods"}
        </h3>
        <div className="top-foods-list scroll-box">
          {sortFoods().slice(0, MAX_FOOD_DISPLAY).map((food, idx) => (
            <div className={`food-card ${getCardColor(idx)}`} key={`${food.name}-${idx}`}>
              <div>
                {getMedal(idx) && <span aria-hidden="true">{getMedal(idx)}</span>}{" "}
                <b>{food.name}</b> - <em>{food.diningHall}</em>
              </div>
              <div>
                P/C: {(food.protein / food.calories).toFixed(2)} - {food.calories} Calories, {food.protein}g Protein
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NutritionDashboard;