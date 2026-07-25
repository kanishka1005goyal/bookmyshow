import { useEffect, useState } from 'react';
import { useParams , useNavigate} from 'react-router-dom';
import { api } from '../services/api';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State to handle the fetched data, loading UI, and errors
  const [movie, setMovie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Calling our mock API service
        const data = await api.getItemById(Number(id));
        setMovie(data);
      } catch (err) {
        setError('Movie/Event not found!');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  // Render a loading screen while waiting for the promise to resolve
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <h2 className="text-xl font-semibold text-gray-600">Loading details...</h2>
      </div>
    );
  }

  // Render an error if the ID doesn't exist in our mock API
  if (error || !movie) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-800">{error || 'Movie/Event not found!'}</h2>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Hero Banner Section */}
      <div className="w-full bg-gray-900 py-12 px-8 lg:px-24 flex flex-col md:flex-row items-center md:items-start gap-10 relative overflow-hidden">
        
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center blur-2xl" 
          style={{ backgroundImage: `url(${movie.img})` }}
        ></div>
        
        <div className="z-10 w-64 flex-shrink-0">
          <img 
            src={movie.img} 
            alt={movie.title} 
            className="w-full h-auto rounded-xl shadow-2xl"
          />
        </div>

        <div className="z-10 flex flex-col gap-4 text-white mt-4 md:mt-0">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          
          <div className="flex items-center gap-4 bg-gray-800 w-fit px-4 py-3 rounded-lg">
            <span className="font-bold text-green-500 text-lg">⭐ {movie.rating || 'N/A'}</span>
            <span className="text-sm text-gray-300">{movie.votes ? `${movie.votes} Ratings` : 'New Release'}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Dynamically render formats */}
            {movie.formats?.map((format: string, index: number) => (
              <span key={index} className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                {format}
              </span>
            ))}
            
            {/* Dynamically render languages */}
            {movie.languages?.map((language: string, index: number) => (
              <span key={`lang-${index}`} className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                {language}
              </span>
            ))}
          </div>

          <p className="text-gray-300 text-sm">
            {movie.duration || 'TBA'} • <span className="text-white font-medium">{movie.genre}</span> • {movie.certification || 'U'} • {movie.releaseDate || 'Coming Soon'}
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
          {movie.about || "Description coming soon."}
        </p>
      </div>
    </div>
  );
}