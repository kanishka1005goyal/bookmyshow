import { useEffect, useState } from "react";
import { Building2, Plus, Search, Trash2, X } from "lucide-react";
import { getTheatres, createTheatre, deleteTheatre, type Theatre } from "../api/admin";
import { ApiError } from "../api/client";

export default function Theatres() {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = (city?: string) => {
    setLoading(true);
    setError(null);
    getTheatres({ city, limit: 50 })
      .then((res) => setTheatres(res.theatres))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load theatres"))
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
    if (!confirm("Deactivate this theatre? It will be hidden from users.")) return;
    try {
      await deleteTheatre(id);
      setTheatres((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to deactivate theatre");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Theatres</h1>
          <p className="text-sm text-gray-500 mt-1">Manage theatre locations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Theatre
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city..."
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
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">City</th>
              <th className="px-5 py-3 font-medium">Address</th>
              <th className="px-5 py-3 font-medium">Amenities</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-5 py-4">
                    <div className="h-4 bg-white/5 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : theatres.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                  <Building2 size={24} className="mx-auto mb-2 opacity-50" />
                  No theatres found
                </td>
              </tr>
            ) : (
              theatres.map((theatre) => (
                <tr key={theatre._id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white font-medium">{theatre.name}</td>
                  <td className="px-5 py-3 text-gray-400">{theatre.city}</td>
                  <td className="px-5 py-3 text-gray-400">{theatre.address}</td>
                  <td className="px-5 py-3 text-gray-400">{theatre.amenities.join(", ") || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeactivate(theatre._id)}
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
        <AddTheatreModal
          onClose={() => setShowForm(false)}
          onCreated={(theatre) => {
            setTheatres((prev) => [theatre, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function AddTheatreModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (theatre: Theatre) => void;
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [amenities, setAmenities] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await createTheatre({
        name,
        city,
        address,
        amenities: amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      });
      onCreated(res.theatre);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create theatre");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#12151c] border border-white/10 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-medium text-white">Add Theatre</h2>
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
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="City">
            <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Address">
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputCls}
              rows={3}
            />
          </Field>
          <Field label="Amenities (comma-separated)">
            <input
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="Parking, Food Court, Wheelchair Access"
              className={inputCls}
            />
          </Field>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {submitting ? "Saving..." : "Save Theatre"}
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