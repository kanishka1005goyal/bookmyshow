import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function MovieDetails() {
  // We remove Number() because MongoDB IDs are strings
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  const [movie, setMovie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError('');
      try {
        // Calling our NEW real API service
        const data = await api.getMovieById(id);
        
        if (data) {
          setMovie(data);
        } else {
          setError('Movie not found in database!');
        }
      } catch (err) {
        setError('Failed to fetch movie details!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <h2 className="text-xl font-semibold text-gray-600">Loading details...</h2>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-800">{error || 'Movie not found!'}</h2>
      </div>
    );
  }

  // Fallback image in case the database doesn't have a posterUrl yet
  const displayImage = movie.posterUrl || "https://placehold.co/400x600?text=No+Poster";

  return (
    <div className="w-full bg-white">
      {/* Hero Banner Section */}
      <div className="w-full bg-gray-900 py-12 px-8 lg:px-24 flex flex-col md:flex-row items-center md:items-start gap-10 relative overflow-hidden">
        
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center blur-2xl" 
          style={{ backgroundImage: `url(${displayImage})` }}
        ></div>
        
        <div className="z-10 w-64 flex-shrink-0">
          <img 
            src={displayImage} 
            alt={movie.title} 
            className="w-full h-auto rounded-xl shadow-2xl"
          />
        </div>

        <div className="z-10 flex flex-col gap-4 text-white mt-4 md:mt-0">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          
          <div className="flex items-center gap-4 bg-gray-800 w-fit px-4 py-3 rounded-lg">
            <span className="font-bold text-green-500 text-lg">⭐ New Release</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* The backend provides a single language string, so we just display it in a badge */}
            {movie.language && (
              <span className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-xs font-semibold capitalize">
                {movie.language}
              </span>
            )}
          </div>

          <p className="text-gray-300 text-sm">
            {/* Mapping backend keys: durationMins, genres, censorRating, releaseDate */}
            {movie.durationMins ? `${movie.durationMins} mins` : 'TBA'} • 
            <span className="text-white font-medium mx-1">
              {movie.genres?.length > 0 ? movie.genres.join(', ') : 'Genre not specified'}
            </span> • 
            <span className="mx-1">{movie.censorRating || 'U/A'}</span> • 
            <span className="mx-1">
              {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'Coming Soon'}
            </span>
          </p>

          <button 
            onClick={() => navigate(`/buytickets/${id}`)}
            className="mt-6 bg-pink-500 hover:bg-pink-600 transition-colors text-white font-semibold py-3 px-12 rounded-lg w-fit text-lg shadow-md"
          >
            Book tickets
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 lg:px-24 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the movie</h2>
        <p className="text-gray-700 leading-relaxed">
          {/* Backend uses 'description' instead of 'about' */}
          {movie.description || "Description coming soon."}
        </p>
      </div>
    </div>
  );
}