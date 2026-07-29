import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';

export default function SeatLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Notice we added showId here! We will need to pass this from the previous page.
  const { movieTitle, theatreName, time, date, showId } = location.state || {};

  const [seats, setSeats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // We now store the entire seat object so we know its dynamic price
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);

  useEffect(() => {
    const fetchSeats = async () => {
      // If we don't have a real showId yet, we can use a temporary dummy ID for testing
      const targetShowId = showId || "dummy-show-id-123"; 
      
      setIsLoading(true);
      const seatData = await api.getSeatMap(targetShowId);
      setSeats(seatData);
      setIsLoading(false);
    };
    fetchSeats();
  }, [showId]);

  // Helper function to group the flat backend array into rows
  // Result: { A: [seat1, seat2], B: [seat3, seat4] }
  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, any[]>);

  // Get unique row letters sorted alphabetically (A, B, C)
  const rowLabels = Object.keys(groupedSeats).sort();

  const toggleSeat = (seat: any) => {
    // Relying on your backend status here!
    if (seat.status !== 'AVAILABLE') return; 

    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.some((s) => s.seatId === seat.seatId);
      if (isAlreadySelected) {
        return prev.filter((s) => s.seatId !== seat.seatId);
      }
      return [...prev, seat];
    });
  };

  // Dynamically calculate total price based on backend multipliers
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (isLoading) return <div className="h-screen flex justify-center items-center font-bold text-xl">Loading Seat Map...</div>;

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
      <div className="bg-white px-8 py-4 border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{movieTitle || "Movie Title"}</h1>
          <p className="text-sm text-gray-500 capitalize">
            {theatreName || "Theatre"} | Jul {date || "24"}, {time || "Showtime"}
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="text-pink-500 font-medium">Cancel</button>
      </div>

      <div className="max-w-4xl mx-auto mt-8 p-4 overflow-x-auto">
        <div className="mb-12 text-center">
          <div className="h-2 w-3/4 mx-auto bg-blue-300 rounded-t-[50%] shadow-[0_10px_20px_rgba(147,197,253,0.5)]"></div>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">All eyes this way</p>
        </div>

        {/* Dynamic Grid Based on Backend Data */}
        <div className="flex flex-col gap-3 max-w-fit mx-auto">
          {rowLabels.map((row) => (
            <div key={row} className="flex items-center gap-4">
              <div className="w-4 text-sm font-bold text-gray-400">{row}</div>
              
              <div className="flex gap-2">
                {/* Sort seats numerically within the row so 1 comes before 2 */}
                {groupedSeats[row]
                  .sort((a: any, b: any) => parseInt(a.label.slice(1)) - parseInt(b.label.slice(1)))
                  .map((seat: any) => {
                  
                  const isBooked = seat.status === 'BOOKED' || seat.status === 'LOCKED';
                  const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);

                  return (
                    <button
                      key={seat.seatId}
                      disabled={isBooked}
                      onClick={() => toggleSeat(seat)}
                      title={`₹${seat.price} - ${seat.seatType}`} // Hover to see price!
                      className={`
                        w-8 h-8 rounded-t-lg text-xs font-medium transition-all duration-200
                        ${isBooked ? 'bg-gray-300 text-gray-100 cursor-not-allowed' : ''}
                        ${isSelected ? 'bg-pink-500 text-white shadow-md transform scale-110' : ''}
                        ${!isBooked && !isSelected ? 'bg-white border border-green-500 text-green-600 hover:bg-green-50' : ''}
                      `}
                    >
                      {/* Extract just the number from the label (e.g., "A1" -> "1") */}
                      {seat.label.replace(row, '')} 
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-6 mt-12 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-green-500 rounded-t-sm"></div> Available
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded-t-sm"></div> Selected
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded-t-sm"></div> Booked/Held
          </div>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_rgba(0,0,0,0.1)] p-4 px-8 flex justify-between items-center z-20">
          <div>
            <p className="text-gray-500 text-sm">
              Selected Seats: <span className="font-bold text-gray-800">{selectedSeats.map(s => s.label).join(', ')}</span>
            </p>
            <p className="text-xl font-bold text-gray-900">₹{totalPrice}</p>
          </div>
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg">
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
}