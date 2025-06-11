import React from 'react';
import './NutritionDashboard.css';

const NutritionDashboard: React.FC = () => {
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
          <div className="restaurant-card darkblue">
            <div>
              <span aria-hidden="true">🥇</span> BPlate - XXX items - Avg P/C: 0.35
            </div>
            <div>
              0.60 mi ~ <em>150 calories burned</em>
            </div>
          </div>
          <div className="restaurant-card blue">
            <div>
              <span aria-hidden="true">🥈</span> De Neve - XXX items - Avg P/C: 0.30
            </div>
            <div>
              0.50 mi ~ <em>130 calories burned</em>
            </div>
          </div>
          <div className="restaurant-card lightblue">
            <div>
              <span aria-hidden="true">🥉</span> Rende West - XXX items - Avg P/C: 0.20
            </div>
            <div>
              0.45 mi ~ <em>70 calories burned</em>
            </div>
          </div>
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