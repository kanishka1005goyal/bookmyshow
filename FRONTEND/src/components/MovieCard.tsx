import { Link } from 'react-router-dom';

interface MovieProps {
  id: number;
  imageSrc: string;
  title: string;
  genre: string;
}

export default function MovieCard({ id, imageSrc, title, genre }: MovieProps) {
  return (
    <Link to={`/movie/${id}`} className="flex flex-col gap-2 w-56 cursor-pointer block group">
      <div className="w-full h-80 rounded-lg overflow-hidden">
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div>
        <h3 className="font-semibold text-lg text-gray-900 truncate">{title}</h3>
        <p className="text-gray-500 text-sm truncate">{genre}</p>
      </div>
    </Link>
  );
}