import { useEffect, useState } from "react";
import { Film, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
  getMovies,
  getMovieFilters,
  createMovie,
  updateMovie,
  deleteMovie,
  type Movie,
} from "../api/admin";
import { ApiError } from "../api/client";

type SortOption = "latest" | "oldest";

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const load = (opts?: { search?: string; genre?: string; year?: string; sort?: SortOption }) => {
    setLoading(true);
    setError(null);
    getMovies({
      search: opts?.search,
      genre: opts?.genre || undefined,
      year: opts?.year ? Number(opts.year) : undefined,
      sort: opts?.sort ?? sort,
      limit: 50,
    })
      .then((res) => setMovies(res.movies))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load movies"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getMovieFilters()
      .then((res) => {
        setGenreOptions(res.genres);
        setYearOptions(res.years);
      })
      .catch(() => {
        // filter dropdowns are a nice-to-have; ignore failures silently
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load({ search: search || undefined, genre, year, sort });
  };

  const handleGenreChange = (value: string) => {
    setGenre(value);
    load({ search: search || undefined, genre: value, year, sort });
  };

  const handleYearChange = (value: string) => {
    setYear(value);
    load({ search: search || undefined, genre, year: value, sort });
  };

  const handleSortChange = (value: SortOption) => {
    setSort(value);
    load({ search: search || undefined, genre, year, sort: value });
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this movie? It will be hidden from users.")) return;
    try {
      await deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to deactivate movie");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Movies</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the movie catalog</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Movie
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movies..."
            className="w-full bg-[#12151c] border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500/50"
          />
        </div>

        <select
          value={genre}
          onChange={(e) => handleGenreChange(e.target.value)}
          className="bg-[#12151c] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500/50"
        >
          <option value="">All Genres</option>
          {genreOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => handleYearChange(e.target.value)}
          className="bg-[#12151c] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500/50"
        >
          <option value="">All Years</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="bg-[#12151c] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500/50"
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="bg-[#12151c] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Genre</th>
              <th className="px-5 py-3 font-medium">Language</th>
              <th className="px-5 py-3 font-medium">Duration</th>
              <th className="px-5 py-3 font-medium">Release Date</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-5 py-4">
                    <div className="h-4 bg-white/5 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : movies.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  <Film size={24} className="mx-auto mb-2 opacity-50" />
                  No movies found
                </td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr key={movie._id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white font-medium">
                    <div className="flex items-center gap-3">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="h-10 w-7 rounded object-cover border border-white/10 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-7 rounded bg-white/5 flex items-center justify-center shrink-0">
                          <Film size={12} className="text-gray-600" />
                        </div>
                      )}
                      {movie.title}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {movie.genres && movie.genres.length > 0 ? movie.genres.join(", ") : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{movie.language}</td>
                  <td className="px-5 py-3 text-gray-400">{movie.durationMins} min</td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(movie.releaseDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{movie.censorRating}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditingMovie(movie)}
                        className="text-gray-500 hover:text-gray-200 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeactivate(movie._id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <MovieFormModal
          onClose={() => setShowForm(false)}
          onSaved={(movie) => {
            setMovies((prev) => [movie, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {editingMovie && (
        <MovieFormModal
          movie={editingMovie}
          onClose={() => setEditingMovie(null)}
          onSaved={(movie) => {
            setMovies((prev) => prev.map((m) => (m._id === movie._id ? movie : m)));
            setEditingMovie(null);
          }}
        />
      )}
    </div>
  );
}
function MovieFormModal({
  movie,
  onClose,
  onSaved,
}: {
  movie?: Movie;
  onClose: () => void;
  onSaved: (movie: Movie) => void;
}) {
  const isEdit = Boolean(movie);
  const [title, setTitle] = useState(movie?.title ?? "");
  const [description, setDescription] = useState(movie?.description ?? "");
  const [posterUrl, setPosterUrl] = useState(movie?.posterUrl ?? "");
  const [language, setLanguage] = useState(movie?.language ?? "");
  const [genresInput, setGenresInput] = useState(movie?.genres?.join(", ") ?? "");
  const [durationMins, setDurationMins] = useState(movie ? String(movie.durationMins) : "");
  const [releaseDate, setReleaseDate] = useState(
    movie ? movie.releaseDate.slice(0, 10) : ""
  );
  const [censorRating, setCensorRating] = useState<"U" | "U/A" | "A" | "S">(
    movie?.censorRating ?? "U/A"
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Frontend pre-validation check
    if (!title || !description || !language || !durationMins || !releaseDate) {
      setError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      const genres = genresInput
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      const payload = {
        title,
        description,
        posterUrl: posterUrl || undefined,
        language,
        genres,
        durationMins: Number(durationMins),
        releaseDate,
        censorRating,
        cast: movie?.cast ?? [],
      };

      const res = isEdit
        ? await updateMovie(movie!._id, payload)
        : await createMovie(payload);
      onSaved(res.movie);
    } catch (err: any) {
      // Displays exact backend validation error message
      setError(err instanceof ApiError ? err.message : `Failed to ${isEdit ? "update" : "create"} movie`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#12151c] border border-white/10 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-medium text-white">{isEdit ? "Edit Movie" : "Add Movie"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
          <Field label="Title">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
              rows={3}
            />
          </Field>
          <Field label="Poster URL">
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://example.com/poster.jpg"
              className={inputCls}
            />
          </Field>
          {posterUrl && (
            <div className="flex justify-center">
              <img
                src={posterUrl}
                alt="Poster preview"
                className="h-32 w-auto rounded-lg border border-white/10 object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Language">
              <input
                required
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Duration (mins)">
              <input
                required
                type="number"
                min={1}
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Genres (comma separated)">
            <input
              value={genresInput}
              onChange={(e) => setGenresInput(e.target.value)}
              placeholder="Animation, Comedy"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Release Date">
              <input
                required
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Censor Rating">
              <select
                value={censorRating}
                onChange={(e) => setCensorRating(e.target.value as typeof censorRating)}
                className={inputCls}
              >
                <option value="U">U</option>
                <option value="U/A">U/A</option>
                <option value="A">A</option>
                <option value="S">S</option>
              </select>
            </Field>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {submitting ? "Saving..." : isEdit ? "Update Movie" : "Save Movie"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-[#0b0d12] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}