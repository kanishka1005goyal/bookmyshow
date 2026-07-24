import mockData from '../data/mockData.json';

// Increase the delay to 1500ms (1.5 seconds) so the loading state is obvious!
const DELAY = 1500; 

export const api = {
  // 1. Get all recommended movies
  getRecommendedMovies: () => {
    console.log("🌐 [MOCK API] GET /api/movies/recommended - Request sent...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ [MOCK API] 200 OK - Returned recommended movies");
        resolve(mockData.recommendedMovies);
      }, DELAY);
    });
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
  }
};