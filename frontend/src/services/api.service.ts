// frontend/src/services/api.service.ts
import axios from 'axios';
import { API_CONFIG } from './api.config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true, // For cookie-based sessions
  headers: {
    'Content-Type': 'application/json'
  }
});

export const nutriBruinAPI = {
  getRecommendations: async (goal: 'cutting' | 'bulking', location?: {lat: number, lng: number}) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.recommendations, { goal, ...location });
    return response.data;
  },
  
  getTodaysMenu: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.todaysMenu);
    return response.data;
  },
  
  getRestaurantMenu: async (restaurantId: string) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.restaurantMenu(restaurantId));
    return response.data;
  }
};