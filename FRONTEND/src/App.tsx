import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import BuyTickets from './pages/BuyTickets';
import Footer from './components/Footer';

function App() {
  return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        {/* Main Content Area - flex-grow ensures the footer is pushed to the bottom */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/buytickets/:id" element={<BuyTickets />} />
          </Routes>
        </main>

        <Footer />
      </div>
  );
}

export default App;