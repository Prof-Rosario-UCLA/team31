//HAVERSINE FORMULA:

// a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
// c = 2 ⋅ atan2( √a, √(1−a)
// d = R ⋅ c

export function haversine(lat1: f64, lng1: f64, lat2: f64, lng2: f64): f64 {
  const RADIUS: f64 = 3958.8; //in miles
  const toRad = (deg: f64): f64 => deg * Math.PI / 180;
  
  const dLat: f64 = toRad(lat2 - lat1);
  const dLng: f64 = toRad(lng2 - lng1);
  const rLat1: f64 = toRad(lat1);
  const rLat2: f64 = toRad(lat2);
  
  //calculation of a
  const a: f64 = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  //calculation of c
  const c: f64 = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  
  //return distance
  return RADIUS * c;
}


//CALORIES BURNED FORMULA
const CALS_PER_MILE: f64 = 80.0;

export function caloriesBurned(distance: f64): f64 {
  return distance * CALS_PER_MILE;
}
