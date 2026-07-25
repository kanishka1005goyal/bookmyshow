import { useEffect, useState } from "react";
import { Tv, Plus, Trash2, X } from "lucide-react";
import {
  getTheatres,
  getScreensByTheatre,
  createScreen,
  deleteScreen,
  type Theatre,
  type Screen,
} from "../api/admin";
import { ApiError } from "../api/client";

export default function Screens() {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [theatreId, setTheatreId] = useState("");
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loadingTheatres, setLoadingTheatres] = useState(true);
  const [loadingScreens, setLoadingScreens] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load the theatre list once, then default-select the first one.
  useEffect(() => {
    getTheatres({ limit: 100 })
      .then((res) => {
        setTheatres(res.theatres);
        if (res.theatres.length > 0) setTheatreId(res.theatres[0]._id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load theatres"))
      .finally(() => setLoadingTheatres(false));
  }, []);

  const loadScreens = (id: string) => {
    if (!id) return;
    setLoadingScreens(true);
    setError(null);
    getScreensByTheatre(id)
      .then((res) => setScreens(res.screens))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load screens"))
      .finally(() => setLoadingScreens(false));
  };

  useEffect(() => {
    if (theatreId) loadScreens(theatreId);
  }, [theatreId]);

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this screen?")) return;
    try {
      await deleteScreen(id);
      setScreens((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to deactivate screen");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Screens</h1>
          <p className="text-sm text-gray-500 mt-1">Manage screens per theatre</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={!theatreId}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Screen
        </button>
      </div>

      <div className="mb-6 max-w-sm">
        <label className="block text-xs text-gray-500 mb-1.5">Theatre</label>
        {loadingTheatres ? (
          <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
        ) : theatres.length === 0 ? (
          <p className="text-sm text-gray-500">No theatres yet — add one on the Theatres page first.</p>
        ) : (
          <select
            value={theatreId}
            onChange={(e) => setTheatreId(e.target.value)}
            className={inputCls}
          >
            {theatres.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} — {t.city}
              </option>
            ))}
          </select>
        )}
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
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Total Seats</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loadingScreens ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-5 py-4">
                    <div className="h-4 bg-white/5 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : screens.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-500">
                  <Tv size={24} className="mx-auto mb-2 opacity-50" />
                  No screens found for this theatre
                </td>
              </tr>
            ) : (
              screens.map((screen) => (
                <tr key={screen._id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white font-medium">{screen.name}</td>
                  <td className="px-5 py-3 text-gray-400">{screen.screenType}</td>
                  <td className="px-5 py-3 text-gray-400">{screen.totalSeats}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeactivate(screen._id)}
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
        <AddScreenModal
          theatreId={theatreId}
          onClose={() => setShowForm(false)}
          onCreated={(screen) => {
            setScreens((prev) => [screen, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function AddScreenModal({
  theatreId,
  onClose,
  onCreated,
}: {
  theatreId: string;
  onClose: () => void;
  onCreated: (screen: Screen) => void;
}) {
  const [name, setName] = useState("");
  const [screenType, setScreenType] = useState<Screen["screenType"]>("2D");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await createScreen({ theatreId, name, screenType });
      onCreated(res.screen);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create screen");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#12151c] border border-white/10 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-medium text-white">Add Screen</h2>
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
          <Field label="Name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Screen 1"
              className={inputCls}
            />
          </Field>
          <Field label="Screen Type">
            <select
              value={screenType}
              onChange={(e) => setScreenType(e.target.value as Screen["screenType"])}
              className={inputCls}
            >
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX">IMAX</option>
              <option value="4DX">4DX</option>
            </select>
          </Field>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {submitting ? "Saving..." : "Save Screen"}
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