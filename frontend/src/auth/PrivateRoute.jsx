import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({ children }) {
  const { token, ready } = useAuth();
  if (!ready) return null; // evita parpadeos
  return token ? children : <Navigate to="/login" replace />;
}
