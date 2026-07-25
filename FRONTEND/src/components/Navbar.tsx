import { Link } from 'react-router-dom';
import { Search, UserCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-2xl font-bold text-red-500 tracking-wider">
          bookmyshow
        </Link>
        <div className="hidden md:flex bg-white rounded flex-row items-center px-2 py-1 w-96">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for Movies, Events, Plays, Sports and Activities" 
            className="w-full px-2 py-1 text-sm text-black outline-none"
          />
        </div>
      </div>
      <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
        <UserCircle size={24} />
        <span className="font-medium">Sign In</span>
      </button>
    </nav>
  );
}