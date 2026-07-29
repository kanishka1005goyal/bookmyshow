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

  // Add this inside the export const api = { ... } block
  getMovieById: async (id: string) => {
    try {
      console.log(`🌐 [REAL API] GET fetching movie details for ID: ${id}...`);
      const response = await fetch(`${API_BASE_URL}/movies/${id}`); 
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ [REAL API] Success - Returned movie details:", data);
      
      // The backend will return a single movie object, so we return it directly
      return data.movie || data.data || data;; 
      
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      return null; 
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
getTheatres: async () => {
    try {
      console.log(`🌐 [REAL API] GET fetching theaters...`);
      // Make sure this matches your backend route (e.g., /api/theatres)
      const response = await fetch(`${API_BASE_URL}/theatres`); 
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ [REAL API] Success - Returned theaters:", data);
      
      // Extract the array from your backend's res.status(200).json({ theatres, ... })
      const realTheatres = data.theatres || []; 
      
      // TEMPORARY FIX: Inject mock showtimes into the real database theaters
      // We also map MongoDB's '_id' to 'id' so your React keys don't break
      const theatresWithShowtimes = realTheatres.map((theatre: any) => ({
        ...theatre,
        id: theatre._id, 
        showtimes: ["09:00 AM", "12:30 PM", "04:15 PM", "08:00 PM"] // Temporary fallback
      }));

      return theatresWithShowtimes;
      
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      return []; 
    }
  },

  // Add this inside your export const api = { ... }
 getSeatMap: async (showId: string) => {
    try {
      console.log(`🌐 [REAL API] Fetching seat map for show: ${showId}`);
      
      // 🔥 THE FIX: Changed /map/ to /show/ to perfectly match your Express router
      const response = await fetch(`${API_BASE_URL}/seats/show/${showId}`); 
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ [REAL API] Success - Returned seat map:", data);
      
      // Your backend returns { showId: '...', seats: [...] }
      return data.seats || []; 
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      return []; 
    }
  },
  // Add this inside export const api = { ... }
  getShowsByMovie: async (movieId: string, dateStr: string) => {
    try {
      console.log(`🌐 [REAL API] Fetching shows for movie ${movieId} on ${dateStr}`);
      // Assuming your route is set up as /api/shows/movie/:movieId
      const response = await fetch(`${API_BASE_URL}/shows/movie/${movieId}?date=${dateStr}`); 
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ [REAL API] Success - Returned shows:", data);
      
      return data.shows || []; 
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      return []; 
    }
  },
}