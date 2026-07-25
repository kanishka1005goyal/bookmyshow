import { useEffect, useState } from "react";
import { Film, Plus, Search, Trash2, X } from "lucide-react";
import { getMovies, createMovie, deleteMovie, type Movie } from "../api/admin";
import { ApiError } from "../api/client";

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = (search?: string) => {
    setLoading(true);
    setError(null);
    getMovies({ search, limit: 50 })
      .then((res) => setMovies(res.movies))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load movies"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search || undefined);
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

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movies..."
            className="w-full bg-[#12151c] border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500/50"
          />
        </div>
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
                  <td colSpan={6} className="px-5 py-4">
                    <div className="h-4 bg-white/5 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : movies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                  <Film size={24} className="mx-auto mb-2 opacity-50" />
                  No movies found
                </td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr key={movie._id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white font-medium">{movie.title}</td>
                  <td className="px-5 py-3 text-gray-400">{movie.language}</td>
                  <td className="px-5 py-3 text-gray-400">{movie.durationMins} min</td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(movie.releaseDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{movie.censorRating}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeactivate(movie._id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                      title="Deactivate"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <AddMovieModal
          onClose={() => setShowForm(false)}
          onCreated={(movie) => {
            setMovies((prev) => [movie, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
function AddMovieModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (movie: Movie) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [durationMins, setDurationMins] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [censorRating, setCensorRating] = useState<"U" | "U/A" | "A" | "S">("U/A");

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
      const res = await createMovie({
        title,
        description,
        language,
        genres: [],
        durationMins: Number(durationMins),
        releaseDate,
        censorRating,
        cast: [],
      });
      onCreated(res.movie);
    } catch (err: any) {
      // Displays exact backend validation error message
      setError(err instanceof ApiError ? err.message : "Failed to create movie");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#12151c] border border-white/10 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-medium text-white">Add Movie</h2>
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
            {submitting ? "Saving..." : "Save Movie"}
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
