export interface Movie {
  _id: string;
  title: string;
  description: string;
  language: string;
  genres: string[];
  durationMins: number;
  releaseDate: string;
  censorRating: 'U' | 'U/A' | 'A' | 'S';
  posterUrl?: string;
  trailerUrl?: string;
  cast: string[];
  isActive: boolean;
}

export interface MoviesResponse {
  movies: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface MovieResponse {
  movie: Movie;
}
