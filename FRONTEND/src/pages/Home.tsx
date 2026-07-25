import { useEffect, useState } from 'react';
import CardSlider from '../components/CardSlider';
import MovieCard from '../components/MovieCard';
import Carousel from '../components/Carousel';
import { api } from '../services/api';

export default function Home() {
  // State to hold our fetched arrays and loading status
  const [recommendedMovies, setRecommendedMovies] = useState<any[]>([]);
  const [premiereMovies, setPremiereMovies] = useState<any[]>([]);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // Fetch all categories at the same time for faster loading
        const [
          fetchedRecommended, 
          fetchedPremieres, 
          fetchedEvents
        ] = await Promise.all([
          api.getRecommendedMovies(),
          api.getPremiereMovies(),
          api.getLocalEvents()
        ]);

        // Update state with the results
        setRecommendedMovies(fetchedRecommended as any[]);
        setPremiereMovies(fetchedPremieres as any[]);
        setLocalEvents(fetchedEvents as any[]);

      } catch (error) {
        console.error("Failed to fetch home page data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Show a loading screen while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <h2 className="text-2xl font-semibold text-gray-600">Loading BookMyShow...</h2>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      
      {/* 1. Main Banner Carousel (Placeholder) */}
      <div> 
        <Carousel />
      </div>

      {/* 2. Recommended Movies Section */}
      <CardSlider title="Recommended Movies">
        {recommendedMovies.map((movie) => (
          <MovieCard 
            key={movie.id}
            id={movie.id}
            title={movie.title}
            genre={movie.genre}
            imageSrc={movie.img}
          />
        ))}
      </CardSlider>

      {/* 3. Stream / Premiere Section (Dark Theme) */}
      <CardSlider title="Premieres" darkTheme={true}>
        {premiereMovies.map((movie) => (
          <MovieCard 
            key={movie.id}
            id={movie.id}
            title={movie.title}
            genre={movie.genre}
            imageSrc={movie.img}
          />
        ))}
      </CardSlider>

       {/* 4. Events happening near you */}
       <CardSlider title="Events Happening Near You">
        {localEvents.map((event) => (
          <MovieCard 
            key={event.id}
            id={event.id}
            title={event.title}
            genre={event.genre} 
            imageSrc={event.img}
          />
        ))}
      </CardSlider>

    </div>
  );
}