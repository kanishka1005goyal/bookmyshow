import { useEffect, useState } from "react";
import { Film, Clock, Ticket, IndianRupee, Inbox } from "lucide-react";
import { getDashboard, type DashboardResponse } from "../api/admin";
import { ApiError } from "../api/client";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboard()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load dashboard");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of movies, shows and bookings</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCardSkeleton
          loading={loading}
          label="Total Movies"
          value={data ? String(data.stats.totalMovies) : "—"}
          icon={Film}
          accent="#ef4444"
        />
        <StatCardSkeleton
          loading={loading}
          label="Today's Shows"
          value={data ? String(data.stats.todaysShows) : "—"}
          icon={Clock}
          accent="#f59e0b"
        />
        <StatCardSkeleton
          loading={loading}
          label="Bookings"
          value={data ? String(data.stats.totalBookings) : "—"}
          icon={Ticket}
          accent="#3b82f6"
        />
        <StatCardSkeleton
          loading={loading}
          label="Revenue"
          value={data ? inr(data.stats.revenue) : "—"}
          icon={IndianRupee}
          accent="#22c55e"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-[#12151c] border border-white/5 rounded-xl">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="font-medium text-white">Recent Bookings</h2>
          </div>
          <div className="p-5">
         {loading ? (
  <ListSkeleton />
) : data && data.recentBookings.length > 0 ? (
  <ul className="divide-y divide-white/5">
    {data.recentBookings.map((booking) => {
      const user = typeof booking.userId === "string" ? null : booking.userId;
      const show = typeof booking.showId === "string" ? null : booking.showId;
      const movie = show && typeof show.movieId !== "string" ? show.movieId : null;
      return (
        <li key={booking._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{movie?.title ?? "Booking"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.name ?? "—"}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm text-white">{inr(booking.totalAmount)}</p>
            <p className="text-xs text-gray-500">{booking.status.replace("_", " ")}</p>
          </div>
        </li>
      );
    })}
  </ul>
) : (
  <EmptyState
    message="No bookings yet"
    hint="Booking data will appear here once the booking module goes live."
  />
)}
          </div>
        </section>

        <section className="bg-[#12151c] border border-white/5 rounded-xl">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="font-medium text-white">Recent Movies</h2>
          </div>
          <div className="p-5">
            {loading ? (
              <ListSkeleton />
            ) : data && data.recentMovies.length > 0 ? (
              <ul className="divide-y divide-white/5">
                {data.recentMovies.map((movie) => (
                  <li key={movie._id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-white/5 flex items-center justify-center text-xs text-gray-500 shrink-0">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Film size={16} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{movie.title}</p>
                      <p className="text-xs text-gray-500">
                        {movie.language} · {movie.durationMins} min
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No movies yet" hint="Add a movie to see it here." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCardSkeleton({
  loading,
  label,
  value,
  icon,
  accent,
}: {
  loading: boolean;
  label: string;
  value: string;
  icon: typeof Film;
  accent: string;
}) {
  if (loading) {
    return (
      <div className="bg-[#12151c] border border-white/5 rounded-xl p-5 flex items-center gap-4 animate-pulse">
        <div className="w-11 h-11 rounded-lg bg-white/5 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 bg-white/5 rounded" />
          <div className="h-5 w-14 bg-white/5 rounded" />
        </div>
      </div>
    );
  }
  const Icon = icon;
  return (
    <div className="bg-[#12151c] border border-white/5 rounded-xl p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-9 bg-white/5 rounded-md" />
      ))}
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="flex flex-col items-center text-center py-8 text-gray-500">
      <Inbox size={28} className="mb-2 opacity-60" />
      <p className="text-sm text-gray-400">{message}</p>
      <p className="text-xs mt-1">{hint}</p>
    </div>
  );
}
