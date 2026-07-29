import { apiFetch } from "./client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface LoginResponse {
  user: AdminUser;
  token: string;
}

export const login = (email: string, password: string) =>
  apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export interface Movie {
  _id: string;
  title: string;
  description: string;
  language: string;
  genres: string[];
  durationMins: number;
  releaseDate: string;
  censorRating: "U" | "U/A" | "A" | "S";
  posterUrl?: string;
  trailerUrl?: string;
  cast: string[];
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalMovies: number;
  todaysShows: number;
  totalBookings: number;
  revenue: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentMovies: Movie[];
  recentBookings: unknown[];
}

export const getDashboard = () => apiFetch<DashboardResponse>("/admin/dashboard");

export const getMovies = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
    year?: number;
    sort?: "latest" | "oldest";
  } = {}
) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.genre) qs.set("genre", params.genre);
  if (params.year) qs.set("year", String(params.year));
  if (params.sort) qs.set("sort", params.sort);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<{ movies: Movie[]; pagination: { page: number; limit: number; total: number } }>(
    `/movies${suffix}`
  );
};

export const getMovieFilters = () =>
  apiFetch<{ genres: string[]; years: number[] }>("/movies/meta/filters");

export type CreateMoviePayload = Omit<Movie, "_id" | "isActive" | "createdAt">;

export const createMovie = (payload: CreateMoviePayload) =>
  apiFetch<{ movie: Movie }>("/movies", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateMovie = (id: string, payload: Partial<CreateMoviePayload>) =>
  apiFetch<{ movie: Movie }>(`/movies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteMovie = (id: string) =>
  apiFetch<{ message: string }>(`/movies/${id}`, { method: "DELETE" });

export interface Theatre {
  _id: string;
  name: string;
  city: string;
  address: string;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
}

export const getTheatres = (params: { page?: number; limit?: number; city?: string } = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.city) qs.set("city", params.city);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<{ theatres: Theatre[]; pagination: { page: number; limit: number; total: number } }>(
    `/theatres${suffix}`
  );
};

export type CreateTheatrePayload = Omit<Theatre, "_id" | "isActive" | "createdAt">;

export const createTheatre = (payload: CreateTheatrePayload) =>
  apiFetch<{ theatre: Theatre }>("/theatres", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateTheatre = (id: string, payload: Partial<CreateTheatrePayload>) =>
  apiFetch<{ theatre: Theatre }>(`/theatres/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteTheatre = (id: string) =>
  apiFetch<{ message: string }>(`/theatres/${id}`, { method: "DELETE" });

export interface Screen {
  _id: string;
  theatreId: string;
  name: string;
  screenType: "2D" | "3D" | "IMAX" | "4DX";
  totalSeats: number;
  isActive: boolean;
}
export interface Booking {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  showId: {
    _id: string;
    movieId: { _id: string; title: string; posterUrl?: string } | string;
    theatreId: { _id: string; name: string; city: string } | string;
    startTime: string;
  } | string;
  seats: { seatId: string; label: string; price: number }[];
  totalAmount: number;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  createdAt: string;
}

export const getAllBookings = (
  params: { status?: Booking["status"]; page?: number; limit?: number } = {}
) => {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<{ bookings: Booking[]; pagination: { page: number; limit: number; total: number } }>(
    `/admin/bookings${suffix}`
  );
};

export interface AdminUserRecord {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  clerkId?: string;
  createdAt: string;
}

export const getAllUsers = (params: { search?: string; page?: number; limit?: number } = {}) => {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<{ users: AdminUserRecord[]; pagination: { page: number; limit: number; total: number } }>(
    `/admin/users${suffix}`
  );
};
export const getScreensByTheatre = (theatreId: string) =>
  apiFetch<{ screens: Screen[] }>(`/screens/theatre/${theatreId}`);

export type CreateScreenPayload = { theatreId: string; name: string; screenType: Screen["screenType"] };

export const createScreen = (payload: CreateScreenPayload) =>
  apiFetch<{ screen: Screen }>("/screens", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateScreen = (id: string, payload: Partial<CreateScreenPayload>) =>
  apiFetch<{ screen: Screen }>(`/screens/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteScreen = (id: string) =>
  apiFetch<{ message: string }>(`/screens/${id}`, { method: "DELETE" });

export interface Show {
  _id: string;
  movieId: { _id: string; title: string } | string;
  theatreId: { _id: string; name: string; city: string } | string;
  screenId: { _id: string; name: string; screenType: string } | string;
  startTime: string;
  endTime: string;
  language: string;
  format: "2D" | "3D" | "IMAX" | "4DX";
  basePrice: number;
  isActive: boolean;
}

export const getShows = (params: { page?: number; limit?: number } = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<{ shows: Show[]; pagination: { page: number; limit: number; total: number } }>(
    `/shows${suffix}`
  );
};

export interface CreateShowPayload {
  movieId: string;
  theatreId: string;
  screenId: string;
  startTime: string;
  endTime: string;
  language: string;
  format: Show["format"];
  basePrice: number;
}

export const createShow = (payload: CreateShowPayload) =>
  apiFetch<{ show: Show }>("/shows", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateShow = (id: string, payload: Partial<CreateShowPayload>) =>
  apiFetch<{ show: Show }>(`/shows/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteShow = (id: string) =>
  apiFetch<{ message: string }>(`/shows/${id}`, { method: "DELETE" });

export interface Seat {
  _id: string;
  screenId: string;
  row: string;
  seatNumber: number;
  label: string;
  seatType: "REGULAR" | "PREMIUM" | "RECLINER";
  priceMultiplier: number;
}

export interface GenerateSeatsRow {
  row: string;
  count: number;
  seatType?: Seat["seatType"];
  priceMultiplier?: number;
}

export const getSeatsByScreen = (screenId: string) =>
  apiFetch<{ seats: Seat[] }>(`/seats/screen/${screenId}`);

export const generateSeats = (payload: { screenId: string; rows: GenerateSeatsRow[] }) =>
  apiFetch<{ seats: Seat[] }>("/seats/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });