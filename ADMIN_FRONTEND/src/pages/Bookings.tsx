import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import { getAllBookings, type Booking } from "../api/admin";
import { ApiError } from "../api/client";

type StatusFilter = "" | Booking["status"];

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const statusStyles: Record<Booking["status"], string> = {
  CONFIRMED: "bg-green-500/10 text-green-400",
  PENDING_PAYMENT: "bg-amber-500/10 text-amber-400",
  CANCELLED: "bg-gray-500/10 text-gray-400",
  EXPIRED: "bg-red-500/10 text-red-400",
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState<StatusFilter>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = (opts?: { status?: StatusFilter }) => {
    setLoading(true);
    setError(null);
    getAllBookings({
      status: (opts?.status || undefined) as Booking["status"] | undefined,
      limit: 50,
    })
      .then((res) => setBookings(res.bookings))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = (value: StatusFilter) => {
    setStatus(value);
    load({ status: value });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">All bookings across users</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
          className="bg-[#12151c] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500/50"
        >
          <option value="">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>
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
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Movie</th>
              <th className="px-5 py-3 font-medium">Theatre</th>
              <th className="px-5 py-3 font-medium">Seats</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Booked On</th>
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
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  <Ticket size={24} className="mx-auto mb-2 opacity-50" />
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const user = typeof booking.userId === "string" ? null : booking.userId;
                const show = typeof booking.showId === "string" ? null : booking.showId;
                const movie = show && typeof show.movieId !== "string" ? show.movieId : null;
                const theatre = show && typeof show.theatreId !== "string" ? show.theatreId : null;

                return (
                  <tr key={booking._id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-white font-medium">
                      {user ? user.name : "—"}
                      <div className="text-xs text-gray-500 font-normal">{user?.email}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{movie?.title ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-400">
                      {theatre ? `${theatre.name}, ${theatre.city}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {booking.seats.map((s) => s.label).join(", ")}
                    </td>
                    <td className="px-5 py-3 text-gray-400">{inr(booking.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${statusStyles[booking.status]}`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}