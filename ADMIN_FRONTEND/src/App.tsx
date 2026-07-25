import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAdmin from "./auth/RequireAdmin";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Movies from "./pages/Movies";
import Theatres from "./pages/Theatres";
import Screens from "./pages/Screens";
import Shows from "./pages/Shows";
import Seats from "./pages/Seats";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<Movies />} />
          <Route path="theatres" element={<Theatres />} />
          <Route path="screens" element={<Screens />} />
          <Route path="shows" element={<Shows />} />
          <Route path="seats" element={<Seats />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}