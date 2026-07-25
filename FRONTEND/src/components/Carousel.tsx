import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import mockData from '../data/mockData.json';

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? mockData.carouselBanners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === mockData.carouselBanners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // Auto-slide every 4 seconds
  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 4000);
    return () => clearInterval(slideInterval); // Cleanup interval on unmount
  }, [currentIndex]);

  return (
    <div className="w-full bg-gray-200 py-2 relative group">
      <div className="max-w-7xl mx-auto h-[300px] relative">
        <div
          style={{ backgroundImage: `url(${mockData.carouselBanners[currentIndex]})` }}
          className="w-full h-full rounded-xl bg-center bg-cover transition-all duration-500 ease-in-out"
        ></div>
        
        {/* Left Arrow */}
        <div className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 -left-4 text-2xl rounded-md p-2 bg-black/40 text-white cursor-pointer hover:bg-black/60 transition">
          <ChevronLeft onClick={prevSlide} size={30} />
        </div>
        
        {/* Right Arrow */}
        <div className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 -right-4 text-2xl rounded-md p-2 bg-black/40 text-white cursor-pointer hover:bg-black/60 transition">
          <ChevronRight onClick={nextSlide} size={30} />
        </div>

        {/* Indicator Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {mockData.carouselBanners.map((_, slideIndex) => (
            <div
              key={slideIndex}
              onClick={() => setCurrentIndex(slideIndex)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                currentIndex === slideIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}