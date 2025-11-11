import { useState } from "react";
import api from "../api.js";

export default function Register() {
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Campo obligatorio";
    if (!form.email.includes("@")) e.email = "Email inválido";
    if (!form.password || form.password.length < 6)
      e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setMsg("");
      await api.post("/auth/register", form);
      setMsg("Usuario registrado. Ahora podés iniciar sesión.");
      setForm({ nombre: "", email: "", password: "" });
      setErrors({});
    } catch (err) {
      setMsg(err.message || "Error al registrar");
    }
  }

  return (
    <section className="section">
      <div className="card card-auth">
        <header>
          <h3 className="title">Crear cuenta</h3>
          <p className="subtitle">
            Completá tus datos para registrarte en el sistema.
          </p>
        </header>

        <div className="content">
          <form onSubmit={onSubmit} noValidate className="form-grid">
            <div className="col-12">
              <label>Nombre</label>
              <input
                name="nombre"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
              {errors.nombre && <small className="error">{errors.nombre}</small>}
            </div>

            <div className="col-12">
              <label>Email</label>
              <input
                name="email"
                placeholder="nombre@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <small className="error">{errors.email}</small>}
            </div>

            <div className="col-12">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && (
                <small className="error">{errors.password}</small>
              )}
            </div>

            <div className="col-12 flex right">
              <button className="btn">Crear cuenta</button>
            </div>
          </form>

          {msg && <p className="mt-2">{msg}</p>}

          <hr className="divider" />

          <p className="hint">
            ¿Ya tenés cuenta? <a href="/login">Iniciar sesión</a>
          </p>
        </div>
      </div>
    </section>
  );
}
