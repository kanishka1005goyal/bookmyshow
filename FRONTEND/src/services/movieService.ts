import api from '../lib/api';
import type { MoviesResponse, MovieResponse } from '../types/movie';

export interface GetMoviesParams {
  search?: string;
  language?: string;
  genre?: string;
  page?: number;
  limit?: number;
}

// GET /api/movies — public, supports search/filter/pagination
export async function getMovies(params?: GetMoviesParams): Promise<MoviesResponse> {
  const { data } = await api.get<MoviesResponse>('/movies', { params });
  return data;
}

// GET /api/movies/:id — public, single movie
export async function getMovieById(id: string): Promise<MovieResponse> {
  const { data } = await api.get<MovieResponse>(`/movies/${id}`);
  return data;
}
