import mockData from '../data/mockData.json';
const DELAY = 1500;
// FRONTEND/src/services/api.ts

// Since your backend .env showed PORT=5000, your base URL will be:
const API_BASE_URL = "http://localhost:5000/api"; 

export const api = {
  // 1. Get all movies from the live database
  getRecommendedMovies: async () => {
    try {
      console.log("🌐 [REAL API] GET fetching movies from backend...");
      
      // Make the actual network request to your backend
      const response = await fetch(`${API_BASE_URL}/movies`); 
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Convert the backend response to JSON
      const data = await response.json();
      console.log("✅ [REAL API] Success - Returned movies:", data);
      
      return data.movies || []; 
      
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      return []; // Return an empty array so your frontend doesn't crash if the server is down
    }
  },

  // 2. Get all premiere movies
  getPremiereMovies: () => {
    console.log("🌐 [MOCK API] GET /api/movies/premieres - Request sent...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ [MOCK API] 200 OK - Returned premiere movies");
        resolve(mockData.premiereMovies);
      }, DELAY);
    });
  },

  // 3. Get all local events
  getLocalEvents: () => {
    console.log("🌐 [MOCK API] GET /api/events/local - Request sent...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ [MOCK API] 200 OK - Returned local events");
        resolve(mockData.localEvents);
      }, DELAY);
    });
  },

  // 4. Get carousel banners
  getCarouselBanners: () => {
    console.log("🌐 [MOCK API] GET /api/banners/carousel - Request sent...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ [MOCK API] 200 OK - Returned carousel banners");
        resolve(mockData.carouselBanners);
      }, DELAY);
    });
  },

  // 5. Get a specific movie or event by ID
  getItemById: (id: number) => {
    console.log(`🌐 [MOCK API] GET /api/items/${id} - Request sent...`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const allItems = [
          ...(mockData.recommendedMovies || []),
          ...(mockData.premiereMovies || []),
          ...(mockData.localEvents || []),
        ];
        
        const item = allItems.find((m) => m.id === id);
        
        if (item) {
          console.log(`✅ [MOCK API] 200 OK - Returned item details for ID: ${id}`);
          resolve(item);
        } else {
          console.error(`❌ [MOCK API] 404 Not Found - No item with ID: ${id}`);
          reject(new Error("Item not found"));
        }
      }, DELAY);
    });
  },

  // 6. Get theatres
  getTheatres: () => {
    console.log("🌐 [MOCK API] GET /api/theatres - Request sent...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ [MOCK API] 200 OK - Returned theatre list");
        resolve(mockData.theatres);
      }, DELAY);
    });
  },
};