import CardSlider from '../components/CardSlider';
import MovieCard from '../components/MovieCard';
import Carousel from '../components/Carousel';
import mockData from '../data/mockData.json';



export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      
      {/* 1. Main Banner Carousel (Placeholder) */}
      <div> <Carousel />
      </div>

      {/* 2. Recommended Movies Section */}
      <CardSlider title="Recommended Movies">
        {mockData.recommendedMovies.map((movie) => (
          <MovieCard 
            key={movie.id}
            title={movie.title}
            genre={movie.genre}
            imageSrc={movie.img}
          />
        ))}
      </CardSlider>

      {/* 3. Stream / Premiere Section (Dark Theme) */}
      <CardSlider title="Premieres" darkTheme={true}>
        {mockData.premiereMovies.map((movie) => (
          <MovieCard 
            key={movie.id}
            title={movie.title}
            genre={movie.genre}
            imageSrc={movie.img}
          />
        ))}
      </CardSlider>

       {/* 4. Events happening near you */}
       <CardSlider title="Events Happening Near You">
        {mockData.localEvents.map((event) => (
          <MovieCard 
            key={event.id}
            title={event.title}
            genre={event.genre} 
            imageSrc={event.img}
          />
        ))}
      </CardSlider>

    </div>
  );
}