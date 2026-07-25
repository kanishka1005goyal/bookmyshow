import { useEffect, useState } from "react";
import { Clock3, Plus, Trash2, X } from "lucide-react";
import {
  getShows,
  createShow,
  deleteShow,
  getMovies,
  getTheatres,
  getScreensByTheatre,
  type Show,
  type Movie,
  type Theatre,
  type Screen,
} from "../api/admin";
import { ApiError } from "../api/client";

// A populated ref comes back as an object from the API; an unpopulated
// one (shouldn't happen from getShows, but just in case) is a plain id string.
function refName(ref: { _id: string; title?: string; name?: string } | string, fallback = "—") {
  if (typeof ref === "string") return fallback;
  return ref.title || ref.name || fallback;
}

export default function Shows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getShows({ limit: 50 })
      .then((res) => setShows(res.shows))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load shows"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this show?")) return;
    try {
      await deleteShow(id);
      setShows((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to deactivate show");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Shows</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule movies on screens</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Show
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="bg-[#12151c] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Movie</th>
              <th className="px-5 py-3 font-medium">Theatre</th>
              <th className="px-5 py-3 font-medium">Screen</th>
              <th className="px-5 py-3 font-medium">Start Time</th>
              <th className="px-5 py-3 font-medium">Format</th>
              <th className="px-5 py-3 font-medium">Price</th>
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
            ) : shows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  <Clock3 size={24} className="mx-auto mb-2 opacity-50" />
                  No shows scheduled
                </td>
              </tr>
            ) : (
              shows.map((show) => (
                <tr key={show._id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white font-medium">{refName(show.movieId)}</td>
                  <td className="px-5 py-3 text-gray-400">{refName(show.theatreId)}</td>
                  <td className="px-5 py-3 text-gray-400">{refName(show.screenId)}</td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(show.startTime).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{show.format}</td>
                  <td className="px-5 py-3 text-gray-400">₹{show.basePrice}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeactivate(show._id)}
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
        <AddShowModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load(); // re-fetch so the new show comes back populated
          }}
        />
      )}
    </div>
  );
}

function AddShowModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);

  const [movieId, setMovieId] = useState("");
  const [theatreId, setTheatreId] = useState("");
  const [screenId, setScreenId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [language, setLanguage] = useState("");
  const [format, setFormat] = useState<Show["format"]>("2D");
  const [basePrice, setBasePrice] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load movies + theatres once for the dropdowns.
  useEffect(() => {
    Promise.all([getMovies({ limit: 100 }), getTheatres({ limit: 100 })])
      .then(([movieRes, theatreRes]) => {
        setMovies(movieRes.movies);
        setTheatres(theatreRes.theatres);
        if (movieRes.movies.length > 0) setMovieId(movieRes.movies[0]._id);
        if (theatreRes.theatres.length > 0) setTheatreId(theatreRes.theatres[0]._id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load options"))
      .finally(() => setLoadingOptions(false));
  }, []);

  // Whenever the selected theatre changes, reload its screens.
  useEffect(() => {
    if (!theatreId) return;
    getScreensByTheatre(theatreId)
      .then((res) => {
        setScreens(res.screens);
        setScreenId(res.screens[0]?._id || "");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load screens"));
  }, [theatreId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createShow({
        movieId,
        theatreId,
        screenId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        language,
        format,
        basePrice: Number(basePrice),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create show");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#12151c] border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-medium text-white">Add Show</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        {loadingOptions ? (
          <div className="p-5 text-sm text-gray-500">Loading movies &amp; theatres...</div>
        ) : movies.length === 0 || theatres.length === 0 ? (
          <div className="p-5 text-sm text-gray-500">
            Add at least one movie and one theatre (with a screen) before scheduling a show.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}
            <Field label="Movie">
              <select value={movieId} onChange={(e) => setMovieId(e.target.value)} className={inputCls}>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Theatre">
              <select value={theatreId} onChange={(e) => setTheatreId(e.target.value)} className={inputCls}>
                {theatres.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} — {t.city}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Screen">
              {screens.length === 0 ? (
                <p className="text-xs text-gray-500">No screens for this theatre yet.</p>
              ) : (
                <select value={screenId} onChange={(e) => setScreenId(e.target.value)} className={inputCls}>
                  {screens.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.screenType})
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Time">
                <input
                  required
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="End Time">
                <input
                  required
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Language">
                <input
                  required
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Format">
                <select value={format} onChange={(e) => setFormat(e.target.value as Show["format"])} className={inputCls}>
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                  <option value="4DX">4DX</option>
                </select>
              </Field>
            </div>
            <Field label="Base Price (₹)">
              <input
                required
                type="number"
                min={1}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className={inputCls}
              />
            </Field>
            <button
              type="submit"
              disabled={submitting || screens.length === 0}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Saving..." : "Save Show"}
            </button>
          </form>
        )}
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