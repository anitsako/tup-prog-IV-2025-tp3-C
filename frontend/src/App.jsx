import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  NavLink,
} from "react-router";
import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Vehiculos from "./pages/Vehiculos.jsx";
import Conductores from "./pages/Conductores.jsx";
import Viajes from "./pages/Viajes.jsx";
import "./app.css";

function isAuthed() {
  return !!localStorage.getItem("token");
}

function Private({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function TopBar() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const refresh = () => setAuthed(!!localStorage.getItem("token"));
    window.addEventListener("authchange", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("authchange", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function logout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authchange"));
    nav("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar__inner container">
        <div className="brand">
          <span>Transporte LR</span>
        </div>

        <nav className="nav">
          {authed ? (
            <>
              <NavLink to="/vehiculos" className="nav__link">Vehículos</NavLink>
              <NavLink to="/conductores" className="nav__link">Conductores</NavLink>
              <NavLink to="/viajes" className="nav__link">Viajes</NavLink>

              <div className="nav__spacer" />
              <button className="btn btn-logout" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav__link">Inicio de sesión</NavLink>
              <NavLink to="/register" className="nav__link">Registro</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function AppRoutes() {
  const home = isAuthed() ? "/vehiculos" : "/login";
  return (
    <Routes>
      <Route path="/" element={<Navigate to={home} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/vehiculos"
        element={
          <Private>
            <Vehiculos />
          </Private>
        }
      />
      <Route
        path="/conductores"
        element={
          <Private>
            <Conductores />
          </Private>
        }
      />
      <Route
        path="/viajes"
        element={
          <Private>
            <Viajes />
          </Private>
        }
      />
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <main className="container">
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
export default App;
