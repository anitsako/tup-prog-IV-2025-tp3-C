import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../api.js";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  function validate() {
    const e = {};
    if (!form.email || !form.email.includes("@")) e.email = "Email inválido";
    if (!form.password) e.password = "Campo obligatorio";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setMsg("");
      const data = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("authchange"));
      nav("/vehiculos");
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <section className="section">
      <div className="card card-auth">
        <header>
          <h1 className="page-title">Inicio de sesión</h1>
          <p className="subtitle">Ingresá con tu email y contraseña.</p>
        </header>

        <form onSubmit={onSubmit} noValidate className="form-grid">
          <div className="input">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e)=>setForm({ ...form, email: e.target.value })}
              placeholder="tu@correo.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={(e)=>setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {msg && <div className="error-text" role="alert">{msg}</div>}

          <div className="flex right mt-2">
            <button className="btn btn-primary">Ingresar</button>
          </div>
        </form>

        {msg && <p className="mt-2">{msg}</p>}

          <hr className="divider" />

          <p className="hint">
            ¿No tenés cuenta? <a href="/register">Crear cuenta</a>
          </p>

      </div>
    </section>
  );
}
