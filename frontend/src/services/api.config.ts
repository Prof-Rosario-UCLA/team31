// frontend/src/services/api.config.ts
export const API_CONFIG = {
    BASE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://nutri-bruin-scraper-228340739101.us-central1.run.app/api'
      : 'http://localhost:8080/api',
    ENDPOINTS: {
      recommendations: '/recommendations',
      todaysMenu: '/menu/today',
      restaurantMenu: (id: string) => `/menu/${id}`,
      scraperStatus: '/scraper/status',
      nutritionSummary: '/menu/nutrition-summary'
    }
  };