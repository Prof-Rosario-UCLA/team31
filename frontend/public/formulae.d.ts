/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/index/haversine
 * @param lat1 `f64`
 * @param lng1 `f64`
 * @param lat2 `f64`
 * @param lng2 `f64`
 * @returns `f64`
 */
export declare function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number;
/**
 * assembly/index/caloriesBurned
 * @param distance `f64`
 * @returns `f64`
 */
export declare function caloriesBurned(distance: number): number;
