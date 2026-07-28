import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Clapperboard } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { user, login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // error already surfaced via auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0d12] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Clapperboard className="text-red-500" size={26} />
          <span className="text-lg font-semibold text-white tracking-tight">
            BookMyShow <span className="text-red-500">Admin</span>
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#12151c] border border-white/5 rounded-xl p-6 space-y-4"
        >
          <div>
            <h1 className="text-lg font-medium text-white">Sign in</h1>
            <p className="text-sm text-gray-500 mt-1">Admin access only</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <label className="block">
            <span className="block text-xs text-gray-500 mb-1.5">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0b0d12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500/50"
              placeholder="admin@bookmyshow.com"
            />
          </label>

          <label className="block">
            <span className="block text-xs text-gray-500 mb-1.5">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b0d12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500/50"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
