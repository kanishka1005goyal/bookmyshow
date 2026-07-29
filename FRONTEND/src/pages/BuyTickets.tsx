import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// Helper to generate the next 5 days in YYYY-MM-DD format for the backend
const generateDates = () => {
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]); // "YYYY-MM-DD"
  }
  return dates;
};

export default function BuyTickets() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState<any>(null);
  const [shows, setShows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize date picker with today's date
  const availableDates = generateDates();
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [movieData, showsData] = await Promise.all([
          api.getMovieById(id),
          api.getShowsByMovie(id, selectedDate) // Fetching real shows!
        ]);
        
        setMovie(movieData);
        setShows(showsData);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPageData();
  }, [id, selectedDate]); // Re-fetch if the user clicks a different date!

  // Group the flat array of shows by Theatre so we can render them properly
  const groupedTheatres = shows.reduce((acc, show) => {
    const theatreId = show.theatreId?._id;
    if (!theatreId) return acc;
    
    if (!acc[theatreId]) {
      acc[theatreId] = {
        id: theatreId,
        name: show.theatreId.name,
        shows: []
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {} as Record<string, any>);

  const theatresToDisplay = Object.values(groupedTheatres);

  if (isLoading) return <div className="h-screen flex justify-center items-center text-xl font-semibold text-gray-600">Loading showtimes...</div>;
  if (!movie) return <div className="h-screen flex justify-center items-center text-2xl font-bold text-gray-800">Movie not found</div>;

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Movie Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">{movie.title}</h1>
        <div className="flex gap-2 mt-2">
          <span className="border border-gray-400 text-gray-600 px-2 py-0.5 rounded-full text-xs uppercase">
            {movie.censorRating || 'UA'}
          </span>
          {movie.language && (
            <span className="bg-gray-100 border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full text-xs uppercase">
              {movie.language}
            </span>
          )}
          <span className="text-gray-500 text-sm ml-2">
            {movie.genres?.length > 0 ? movie.genres.join(', ') : 'Genre not specified'}
          </span>
        </div>
      </div>

      {/* Date Selector Strip */}
      <div className="bg-white border-b border-gray-200 px-8 py-2 sticky top-0 z-10 flex items-center gap-4 overflow-x-auto">
        {availableDates.map((dateStr) => {
          const dateObj = new Date(dateStr);
          const dayNumber = dateObj.getDate();
          const monthStr = dateObj.toLocaleString('default', { month: 'short' });

          return (
            <button 
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors min-w-[60px] ${selectedDate === dateStr ? 'bg-pink-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <span className="text-xs font-semibold uppercase">{monthStr}</span>
              <span className="text-lg font-bold">{dayNumber}</span>
            </button>
          )
        })}
      </div>

      {/* Theatre List */}
      <div className="max-w-6xl mx-auto mt-6 bg-white rounded-sm shadow-sm p-4">
        {theatresToDisplay.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No shows available for this date.</div>
        ) : (
          theatresToDisplay.map((theatre: any) => (
            <div key={theatre.id} className="flex flex-col md:flex-row py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-4">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-gray-400 text-lg">♡</span> {theatre.name}
                </h3>
              </div>

              <div className="w-full md:w-2/3 flex flex-wrap gap-4 items-center">
                {theatre.shows.map((show: any) => {
                  // Format the startTime safely to display like "10:30 AM"
                  const timeString = new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <button 
                      key={show._id} 
                      onClick={() => navigate('/seatlayout', { 
                        state: { 
                          showId: show._id, // 🔥 PASSING THE REAL SHOW ID!
                          movieTitle: movie.title, 
                          theatreName: theatre.name, 
                          time: timeString,
                          date: selectedDate
                        } 
                      })}
                      className="border border-green-500 text-green-600 hover:bg-green-50 px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      {timeString}
                      <div className="text-[10px] text-gray-400 mt-0.5">{show.format}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}