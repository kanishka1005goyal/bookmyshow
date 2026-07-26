import { useEffect, useState } from "react";
import { LayoutGrid, Plus, Trash2 } from "lucide-react";
import {
  getTheatres,
  getScreensByTheatre,
  getSeatsByScreen,
  generateSeats,
  type Theatre,
  type Screen,
  type Seat,
  type GenerateSeatsRow,
} from "../api/admin";
import { ApiError } from "../api/client";

export default function Seats() {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [theatreId, setTheatreId] = useState("");
  const [screenId, setScreenId] = useState("");
  const [existingSeats, setExistingSeats] = useState<Seat[]>([]);
  const [rows, setRows] = useState<GenerateSeatsRow[]>([
    { row: "A", count: 10, seatType: "REGULAR", priceMultiplier: 1 },
  ]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getTheatres({ limit: 100 })
      .then((res) => {
        setTheatres(res.theatres);
        if (res.theatres.length > 0) setTheatreId(res.theatres[0]._id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load theatres"))
      .finally(() => setLoadingOptions(false));
  }, []);

  useEffect(() => {
    if (!theatreId) return;
    getScreensByTheatre(theatreId)
      .then((res) => {
        setScreens(res.screens);
        setScreenId(res.screens[0]?._id || "");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load screens"));
  }, [theatreId]);

  const loadExistingSeats = (id: string) => {
    if (!id) {
      setExistingSeats([]);
      return;
    }
    setLoadingSeats(true);
    getSeatsByScreen(id)
      .then((res) => setExistingSeats(res.seats))
      .catch(() => setExistingSeats([]))
      .finally(() => setLoadingSeats(false));
  };

  useEffect(() => {
    loadExistingSeats(screenId);
  }, [screenId]);

  const updateRow = (index: number, patch: Partial<GenerateSeatsRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    const nextLetter = String.fromCharCode(65 + rows.length); // A, B, C...
    setRows((prev) => [...prev, { row: nextLetter, count: 10, seatType: "REGULAR", priceMultiplier: 1 }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await generateSeats({ screenId, rows });
      setSuccess(`${res.seats.length} seats generated.`);
      loadExistingSeats(screenId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate seats");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPlanned = rows.reduce((sum, r) => sum + (r.count || 0), 0);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Seat Layout</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate the physical seat map for a screen. Re-running this replaces the screen's existing layout.
        </p>
      </div>

      {loadingOptions ? (
        <div className="h-10 bg-white/5 rounded-lg animate-pulse mb-6" />
      ) : theatres.length === 0 ? (
        <p className="text-sm text-gray-500">Add a theatre first on the Theatres page.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Theatre</label>
            <select value={theatreId} onChange={(e) => setTheatreId(e.target.value)} className={inputCls}>
              {theatres.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} — {t.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Screen</label>
            {screens.length === 0 ? (
              <p className="text-sm text-gray-500 pt-2">No screens for this theatre yet.</p>
            ) : (
              <select value={screenId} onChange={(e) => setScreenId(e.target.value)} className={inputCls}>
                {screens.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.screenType})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {screenId && (
        <p className="text-sm text-gray-500 mb-6">
          {loadingSeats ? "Checking existing layout..." : `Currently ${existingSeats.length} seats exist for this screen.`}
        </p>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {screenId && (
        <form onSubmit={handleSubmit} className="bg-[#12151c] border border-white/5 rounded-xl p-5">
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr_1fr_1fr_auto] gap-2 items-end">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Row</label>
                  <input
                    value={r.row}
                    onChange={(e) => updateRow(i, { row: e.target.value.toUpperCase() })}
                    className={inputCls}
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Seats in Row</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={r.count}
                    onChange={(e) => updateRow(i, { count: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    value={r.seatType}
                    onChange={(e) => updateRow(i, { seatType: e.target.value as Seat["seatType"] })}
                    className={inputCls}
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="RECLINER">Recliner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price ×</label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={r.priceMultiplier}
                    onChange={(e) => updateRow(i, { priceMultiplier: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  className="text-gray-500 hover:text-red-400 disabled:opacity-30 h-10"
                  title="Remove row"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
          >
            <Plus size={14} />
            Add Row
          </button>

          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <LayoutGrid size={14} />
              {totalPlanned} seats will be generated
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Generating..." : "Generate Seats"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const inputCls =
  "w-full bg-[#0b0d12] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500/50";