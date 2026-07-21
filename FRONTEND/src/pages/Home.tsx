import CardSlider from '../components/CardSlider';
import MovieCard from '../components/MovieCard';
import Carousel from '../components/Carousel';
// 1. Array for Recommended Movies
const recommendedMovies = [
  { id: 1, title: 'Kalki 2898 AD', genre: 'Action/Sci-Fi/Thriller', img: 'https://placehold.co/400x600/1a1a1a/FFFFFF?text=Kalki\n2898+AD' },
  { id: 2, title: 'Deadpool & Wolverine', genre: 'Action/Comedy', img: 'https://placehold.co/400x600/8b0000/FFFFFF?text=Deadpool\n%26\nWolverine' },
  { id: 3, title: 'Despicable Me 4', genre: 'Animation/Comedy', img: 'https://placehold.co/400x600/fada5e/000000?text=Despicable\nMe+4' },
  { id: 4, title: 'Kill', genre: 'Action/Thriller', img: 'https://placehold.co/400x600/333333/FFFFFF?text=Kill' },
  { id: 5, title: 'Bad Newz', genre: 'Comedy', img: 'https://placehold.co/400x600/4a90e2/FFFFFF?text=Bad\nNewz' },
];

// 2. New Array for Premieres
const premiereMovies = [
  { id: 101, title: 'Longlegs', genre: 'English', img: 'https://placehold.co/400x600/540b0e/FFFFFF?text=Longlegs' },
  { id: 102, title: 'Twisters', genre: 'English', img: 'https://placehold.co/400x600/335c67/FFFFFF?text=Twisters' },
  { id: 103, title: 'Fly Me to the Moon', genre: 'English', img: 'https://placehold.co/400x600/e09f3e/FFFFFF?text=Fly+Me\nto+the\nMoon' },
  { id: 104, title: 'A Quiet Place: Day One', genre: 'English', img: 'https://placehold.co/400x600/1e2f23/FFFFFF?text=A+Quiet\nPlace' },
  { id: 105, title: 'Inside Out 2', genre: 'English', img: 'https://placehold.co/400x600/9e2a2b/FFFFFF?text=Inside\nOut+2' },
];

// 3. New Array for Local Events
const localEvents = [
  { id: 201, title: 'Gaurav Kapoor Live', genre: 'Comedy Shows', img: 'https://placehold.co/400x600/ff9f1c/000000?text=Gaurav\nKapoor' },
  { id: 202, title: 'Sunburn Arena ft. Alan Walker', genre: 'Music Festivals', img: 'https://placehold.co/400x600/2ec4b6/000000?text=Alan\nWalker' },
  { id: 203, title: 'Jo Bolta Hai Wohi Hota Hai', genre: 'Stand up Comedy', img: 'https://placehold.co/400x600/e71d36/FFFFFF?text=Harsh\nGujral' },
  { id: 204, title: 'Osho Meditation Camp', genre: 'Workshops', img: 'https://placehold.co/400x600/011627/FFFFFF?text=Osho\nCamp' },
  { id: 205, title: 'Rajputana FC vs Jaipur City', genre: 'Football', img: 'https://placehold.co/400x600/41ead4/000000?text=Football\nMatch' },
];

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      
      {/* 1. Main Banner Carousel (Placeholder) */}
      <div> <Carousel />
      </div>

      {/* 2. Recommended Movies Section */}
      <CardSlider title="Recommended Movies">
        {recommendedMovies.map((movie) => (
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
        {premiereMovies.map((movie) => (
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
        {localEvents.map((event) => (
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