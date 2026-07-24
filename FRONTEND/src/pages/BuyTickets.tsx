import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function BuyTickets() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState<any>(null);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(24);

  useEffect(() => {
    const fetchPageData = async () => {
      setIsLoading(true);
      try {
        // Fetch both movie details and theatres concurrently
        const [movieData, theatreData] = await Promise.all([
          api.getItemById(Number(id)),
          api.getTheatres()
        ]);
        
        setMovie(movieData);
        setTheatres(theatreData as any[]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPageData();
  }, [id]);

  if (isLoading) return <div className="h-screen flex justify-center items-center text-xl font-semibold text-gray-600">Loading showtimes...</div>;
  if (!movie) return <div className="h-screen flex justify-center items-center text-2xl font-bold text-gray-800">Movie not found</div>;

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Movie Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">{movie.title}</h1>
        <div className="flex gap-2 mt-2">
          <span className="border border-gray-400 text-gray-600 px-2 py-0.5 rounded-full text-xs uppercase">{movie.certification || 'UA'}</span>
          {movie.formats?.map((format: string) => (
            <span key={format} className="bg-gray-100 border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full text-xs uppercase">{format}</span>
          ))}
          <span className="text-gray-500 text-sm ml-2">{movie.genre}</span>
        </div>
      </div>

      {/* Date Selector Strip */}
      <div className="bg-white border-b border-gray-200 px-8 py-2 sticky top-0 z-10 flex items-center gap-4">
        {[24, 25, 26, 27, 28].map((day) => (
          <button 
            key={day}
            onClick={() => setSelectedDate(day)}
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${selectedDate === day ? 'bg-pink-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <span className="text-xs font-semibold uppercase">Jul</span>
            <span className="text-lg font-bold">{day}</span>
          </button>
        ))}
        
        {/* Filters Placeholder */}
        <div className="ml-auto flex gap-4 text-sm text-gray-600">
          <span className="cursor-pointer hover:text-gray-900 border-r pr-4">Hindi-2D</span>
          <span className="cursor-pointer hover:text-gray-900 border-r pr-4">Filter Price Range</span>
          <span className="cursor-pointer hover:text-gray-900">Filter Show Timings</span>
        </div>
      </div>

      {/* Theatre List */}
      <div className="max-w-6xl mx-auto mt-6 bg-white rounded-sm shadow-sm p-4">
        {theatres.map((theatre) => (
          <div key={theatre.id} className="flex flex-col md:flex-row py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-4">
            {/* Theatre Info */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-gray-400 text-lg">♡</span> {theatre.name}
              </h3>
              <div className="flex gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> M-Ticket</span>
                <span className="flex items-center gap-1 text-orange-500"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Food & Beverage</span>
              </div>
            </div>

            {/* Showtimes */}
            <div className="w-full md:w-2/3 flex flex-wrap gap-4 items-center">
              {theatre.showtimes.map((time: string, index: number) => (
                <button 
                  key={index} 
                  onClick={() => alert(`Next stop: Seat selection for ${time}!`)}
                  className="border border-green-500 text-green-600 hover:bg-green-50 px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}