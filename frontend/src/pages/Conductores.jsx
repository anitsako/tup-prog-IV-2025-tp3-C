import { useEffect, useRef, useState } from "react";
import api from "../api.js";

export default function Conductores() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  // búsqueda (toolbar)
  const [q, setQ] = useState("");

  // alta
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    licencia: "",
    licencia_vencimiento: "",
  });
  const [errors, setErrors] = useState({});

  // edición
  const editRef = useRef();
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    licencia: "",
    licencia_vencimiento: "",
  });
  const [editErrors, setEditErrors] = useState({});

  async function load() {
    try {
      setItems(await api.get("/conductores"));
    } catch (e) {
      setMsg(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  function validate(data, setErr) {
    const e = {};
    if (!data.nombre.trim()) e.nombre = "Obligatorio";
    if (!data.apellido.trim()) e.apellido = "Obligatorio";
    if (!/^[0-9]{7,8}$/.test(data.dni.trim())) e.dni = "DNI 7 u 8 dígitos";
    if (!data.licencia.trim()) e.licencia = "Obligatorio";
    if (!data.licencia_vencimiento) e.licencia_vencimiento = "Obligatorio";
    setErr(e);
    return Object.keys(e).length === 0;
  }

  // ===== Crear =====
  async function onSubmit(ev) {
    ev.preventDefault();
    if (!validate(form, setErrors)) return;
    try {
      const body = {
        ...form,
        licencia_vencimiento: new Date(form.licencia_vencimiento)
          .toISOString()
          .slice(0, 10),
      };
      await api.post("/conductores", body);
      setForm({ nombre: "", apellido: "", dni: "", licencia: "", licencia_vencimiento: "" });
      setErrors({});
      load();
    } catch (e) { setMsg(e.message); }
  }

  async function onDelete(id) {
    if (!confirm("¿Eliminar conductor?")) return;
    try {
      await api.del(`/conductores/${id}`);
      load();
    } catch (e) { alert(e.message); }
  }

  // ===== Editar =====
  function openEdit(c) {
    setEditItem(c);
    setEditForm({
      nombre: c.nombre,
      apellido: c.apellido,
      dni: c.dni,
      licencia: c.licencia,
      licencia_vencimiento: c.licencia_vencimiento?.slice(0, 10) || "",
    });
    setEditErrors({});
    editRef.current.showModal();
  }

  async function onUpdate(ev) {
    ev.preventDefault();
    if (!validate(editForm, setEditErrors)) return;
    try {
      const body = {
        ...editForm,
        licencia_vencimiento: new Date(editForm.licencia_vencimiento)
          .toISOString()
          .slice(0, 10),
      };
      await api.put(`/conductores/${editItem.id}`, body);
      editRef.current.close();
      setEditItem(null);
      load();
    } catch (e) { alert(e.message); }
  }

  // filtro local por búsqueda
  const filtered = items.filter((c) => {
    if (!q) return true;
    const hay = (c.nombre + c.apellido + c.dni + c.licencia).toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <section className="section">
      <div className="card">
        <header>
          <h3 className="title">Conductores</h3>
        </header>
          {/* Form alta */}
          <form onSubmit={onSubmit} noValidate className="form-grid">
            <div className="col-6">
              <label>Nombre</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
              {errors.nombre && <small className="error">{errors.nombre}</small>}
            </div>

            <div className="col-6">
              <label>Apellido</label>
              <input
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              />
              {errors.apellido && <small className="error">{errors.apellido}</small>}
            </div>

            <div className="col-4">
              <label>DNI</label>
              <input
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value })}
              />
              {errors.dni && <small className="error">{errors.dni}</small>}
            </div>

            <div className="col-4">
              <label>Licencia</label>
              <input
                value={form.licencia}
                onChange={(e) => setForm({ ...form, licencia: e.target.value })}
              />
              {errors.licencia && <small className="error">{errors.licencia}</small>}
            </div>

            <div className="col-4">
              <label>Vencimiento</label>
              <input
                type="date"
                value={form.licencia_vencimiento}
                onChange={(e) =>
                  setForm({ ...form, licencia_vencimiento: e.target.value })
                }
              />
              {errors.licencia_vencimiento && (
                <small className="error">{errors.licencia_vencimiento}</small>
              )}
            </div>

            <div className="col-12 flex right">
              <button className="btn">Guardar conductor</button>
            </div>
          </form>

          {msg && <p className="mt-2">{msg}</p>}

<div className="content">
          {/* Toolbar */}
          <div className="toolbar">
            <div className="search">
              <input
                placeholder="Buscar por nombre, apellido, DNI o licencia…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <span className="muted">{filtered.length} ítem(s)</span>
            <button className="btn icon" onClick={load}>⟲ Recargar</button>
          </div>
          {/* Tabla */}
          <div className="table-wrap mt-2">
            {filtered.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No hay registros.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>DNI</th>
                    <th>Licencia</th>
                    <th>Vence</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td>{c.nombre}</td>
                      <td>{c.apellido}</td>
                      <td>{c.dni}</td>
                      <td>{c.licencia}</td>
                      <td>{c.licencia_vencimiento?.slice(0, 10)}</td>
                      <td className="actions">
                        <button className="btn ghost" onClick={() => openEdit(c)}>
                          Editar
                        </button>
                        <button className="btn secondary" onClick={() => onDelete(c.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal Editar */}
      <dialog ref={editRef}>
        <article>
          <h3>Editar conductor</h3>
          {editItem && (
            <form onSubmit={onUpdate} noValidate className="form-grid mt-2">
              <div className="col-6">
                <label>Nombre</label>
                <input
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                />
                {editErrors.nombre && <small className="error">{editErrors.nombre}</small>}
              </div>

              <div className="col-6">
                <label>Apellido</label>
                <input
                  value={editForm.apellido}
                  onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                />
                {editErrors.apellido && <small className="error">{editErrors.apellido}</small>}
              </div>

              <div className="col-4">
                <label>DNI</label>
                <input
                  value={editForm.dni}
                  onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                />
                {editErrors.dni && <small className="error">{editErrors.dni}</small>}
              </div>

              <div className="col-4">
                <label>Licencia</label>
                <input
                  value={editForm.licencia}
                  onChange={(e) => setEditForm({ ...editForm, licencia: e.target.value })}
                />
                {editErrors.licencia && <small className="error">{editErrors.licencia}</small>}
              </div>

              <div className="col-4">
                <label>Vencimiento</label>
                <input
                  type="date"
                  value={editForm.licencia_vencimiento}
                  onChange={(e) =>
                    setEditForm({ ...editForm, licencia_vencimiento: e.target.value })
                  }
                />
                {editErrors.licencia_vencimiento && (
                  <small className="error">{editErrors.licencia_vencimiento}</small>
                )}
              </div>

              <div className="col-12 flex right">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => editRef.current.close()}
                >
                  Cancelar
                </button>
                <button className="btn">Guardar cambios</button>
              </div>
            </form>
          )}
        </article>
      </dialog>
    </section>
  );
}
