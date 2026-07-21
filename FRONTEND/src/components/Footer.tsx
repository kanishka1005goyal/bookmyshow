import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
export default function Footer() {
  return (
    <footer className="bg-[#313131] text-white mt-12">
      
      {/* 1. List Your Show Strip */}
      <div className="bg-[#2b2b2b] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold">List your Show</h3>
            <p className="text-gray-400 text-sm hidden md:block">
              Got a show, event, activity or a great experience? Partner with us & get listed on BookMyShow
            </p>
          </div>
          <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold transition">
            Contact today!
          </button>
        </div>
      </div>

      {/* 2. Link Directories */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        
        <div>
          <h4 className="text-gray-400 font-semibold mb-4 uppercase text-xs tracking-wider">Movies By Genre</h4>
          <ul className="flex flex-col gap-2 text-gray-500">
            <li className="hover:text-white cursor-pointer transition">Action Movies</li>
            <li className="hover:text-white cursor-pointer transition">Comedy Movies</li>
            <li className="hover:text-white cursor-pointer transition">Sci-Fi Movies</li>
            <li className="hover:text-white cursor-pointer transition">Romantic Movies</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-400 font-semibold mb-4 uppercase text-xs tracking-wider">Movies By City</h4>
          <ul className="flex flex-col gap-2 text-gray-500">
            <li className="hover:text-white cursor-pointer transition">Movies in Mumbai</li>
            <li className="hover:text-white cursor-pointer transition">Movies in Delhi-NCR</li>
            <li className="hover:text-white cursor-pointer transition">Movies in Jaipur</li>
            <li className="hover:text-white cursor-pointer transition">Movies in Bengaluru</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-400 font-semibold mb-4 uppercase text-xs tracking-wider">Events In Top Cities</h4>
          <ul className="flex flex-col gap-2 text-gray-500">
            <li className="hover:text-white cursor-pointer transition">Events in Mumbai</li>
            <li className="hover:text-white cursor-pointer transition">Events in Delhi-NCR</li>
            <li className="hover:text-white cursor-pointer transition">Events in Jaipur</li>
            <li className="hover:text-white cursor-pointer transition">Events in Bengaluru</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-400 font-semibold mb-4 uppercase text-xs tracking-wider">Help</h4>
          <ul className="flex flex-col gap-2 text-gray-500">
            <li className="hover:text-white cursor-pointer transition">About Us</li>
            <li className="hover:text-white cursor-pointer transition">Contact Us</li>
            <li className="hover:text-white cursor-pointer transition">Current Openings</li>
            <li className="hover:text-white cursor-pointer transition">FAQs</li>
          </ul>
        </div>
      </div>

      {/* 3. Logo & Socials */}
      <div className="border-t border-gray-600 pt-8 pb-12">
        <div className="flex flex-col items-center justify-center gap-6">
          <h2 className="text-3xl font-bold text-white tracking-widest">book<span className="text-red-500">my</span>show</h2>
          
          <div className="flex gap-4">
            <div className="bg-gray-700 p-2 rounded-full hover:bg-white hover:text-black cursor-pointer transition">
              <FaFacebook size={20} />
            </div>
            <div className="bg-gray-700 p-2 rounded-full hover:bg-white hover:text-black cursor-pointer transition">
              <FaTwitter size={20} />
            </div>
            <div className="bg-gray-700 p-2 rounded-full hover:bg-white hover:text-black cursor-pointer transition">
              <FaInstagram size={20} />
            </div>
            <div className="bg-gray-700 p-2 rounded-full hover:bg-white hover:text-black cursor-pointer transition">
              <FaYoutube size={20} />
            </div>
          </div>
          
          <p className="text-gray-500 text-xs text-center px-4">
            Copyright 2026 © Bigtree Entertainment Pvt. Ltd. All Rights Reserved. <br/>
            The content and images used on this site are copyright protected and copyrights vests with the respective owners.
          </p>
        </div>
      </div>

    </footer>
  );
}