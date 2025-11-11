import { useEffect, useRef, useState } from "react";
import api from "../api.js";

export default function Vehiculos() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    patente: "",
    año: "",
    capacidad_carga: "",
  });
  const [errors, setErrors] = useState({});

  // búsqueda (toolbar)
  const [q, setQ] = useState("");

  // Edición
  const editRef = useRef();
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    marca: "",
    modelo: "",
    patente: "",
    año: "",
    capacidad_carga: "",
  });
  const [editErrors, setEditErrors] = useState({});

  async function load() {
    try {
      setItems(await api.get("/vehiculos"));
    } catch (e) {
      setMsg(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function validate(data, setErr) {
    const e = {};
    if (!data.marca.trim()) e.marca = "Obligatorio";
    if (!data.modelo.trim()) e.modelo = "Obligatorio";
    if (!/^[A-Z0-9]{6,7}$/i.test(data.patente.trim()))
      e.patente = "Formato sugerido: AA123BB";
    if (!/^\d{4}$/.test(String(data.año))) e.año = "Año (4 dígitos)";
    if (isNaN(Number(data.capacidad_carga)) || Number(data.capacidad_carga) < 0)
      e.capacidad_carga = "Número válido";
    setErr(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (!validate(form, setErrors)) return;
    try {
      await api.post("/vehiculos", {
        ...form,
        año: Number(form.año),
        capacidad_carga: Number(form.capacidad_carga),
      });
      setForm({ marca: "", modelo: "", patente: "", año: "", capacidad_carga: "" });
      setErrors({});
      load();
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function onDelete(id) {
    if (!confirm("¿Eliminar vehículo?")) return;
    try {
      await api.del(`/vehiculos/${id}`);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  function openEdit(v) {
    setEditItem(v);
    setEditForm({
      marca: v.marca,
      modelo: v.modelo,
      patente: v.patente,
      año: v.año ?? "",
      capacidad_carga: v.capacidad_carga ?? "",
    });
    setEditErrors({});
    editRef.current.showModal();
  }

  async function onUpdate(ev) {
    ev.preventDefault();
    if (!validate(editForm, setEditErrors)) return;
    try {
      await api.put(`/vehiculos/${editItem.id}`, {
        ...editForm,
        año: Number(editForm.año),
        capacidad_carga: Number(editForm.capacidad_carga),
      });
      editRef.current.close();
      setEditItem(null);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  const filtered = items.filter((v) =>
    !q
      ? true
      : (v.marca + v.modelo + v.patente)
          .toLowerCase()
          .includes(q.toLowerCase())
  );

  return (
    <section className="section">
      <div className="card">
        <header>
          <h3 className="title">Vehículos</h3>
        </header>

        {/* Form alta */}
          <form onSubmit={onSubmit} noValidate className="form-grid">
            <div className="col-6">
              <label>Marca</label>
              <input
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
              />
              {errors.marca && <small className="error">{errors.marca}</small>}
            </div>
            <div className="col-6">
              <label>Modelo</label>
              <input
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              />
              {errors.modelo && <small className="error">{errors.modelo}</small>}
            </div>
            <div className="col-4">
              <label>Patente</label>
              <input
                value={form.patente}
                onChange={(e) => setForm({ ...form, patente: e.target.value })}
              />
              {errors.patente && <small className="error">{errors.patente}</small>}
            </div>
            <div className="col-4">
              <label>Año</label>
              <input
                value={form.año}
                onChange={(e) => setForm({ ...form, año: e.target.value })}
              />
              {errors.año && <small className="error">{errors.año}</small>}
            </div>
            <div className="col-4">
              <label>Capacidad de carga (kg)</label>
              <input
                value={form.capacidad_carga}
                onChange={(e) =>
                  setForm({ ...form, capacidad_carga: e.target.value })
                }
              />
              {errors.capacidad_carga && (
                <small className="error">{errors.capacidad_carga}</small>
              )}
            </div>

            <div className="col-12 flex right">
              <button className="btn">Guardar vehículo</button>
            </div>
          </form>

          {msg && <p className="mt-2">{msg}</p>}

<div className="content">
          <div className="toolbar">
            <div className="search">
              <input
                placeholder="Buscar por marca, modelo o patente…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button className="btn icon" onClick={load}>
              Cargar datos
            </button>
          </div>
          {/* Tabla */}
          <div className="table-wrap mt-2">
            {filtered.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No hay registros.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Patente</th>
                    <th>Año</th>
                    <th>Cap. (kg)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id}>
                      <td>{v.marca}</td>
                      <td>{v.modelo}</td>
                      <td>{v.patente}</td>
                      <td>{v.año}</td>
                      <td>{Number(v.capacidad_carga).toLocaleString()}</td>
                      <td className="actions">
                        <button className="btn ghost" onClick={() => openEdit(v)}>
                          Editar
                        </button>
                        <button
                          className="btn secondary"
                          onClick={() => onDelete(v.id)}
                        >
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

      {/* Modal editar */}
      <dialog ref={editRef}>
        <article>
          <h3>Editar vehículo</h3>
          {editItem && (
            <form onSubmit={onUpdate} noValidate className="form-grid mt-2">
              <div className="col-6">
                <label>Marca</label>
                <input
                  value={editForm.marca}
                  onChange={(e) =>
                    setEditForm({ ...editForm, marca: e.target.value })
                  }
                />
                {editErrors.marca && (
                  <small className="error">{editErrors.marca}</small>
                )}
              </div>
              <div className="col-6">
                <label>Modelo</label>
                <input
                  value={editForm.modelo}
                  onChange={(e) =>
                    setEditForm({ ...editForm, modelo: e.target.value })
                  }
                />
                {editErrors.modelo && (
                  <small className="error">{editErrors.modelo}</small>
                )}
              </div>
              <div className="col-4">
                <label>Patente</label>
                <input
                  value={editForm.patente}
                  onChange={(e) =>
                    setEditForm({ ...editForm, patente: e.target.value })
                  }
                />
                {editErrors.patente && (
                  <small className="error">{editErrors.patente}</small>
                )}
              </div>
              <div className="col-4">
                <label>Año</label>
                <input
                  value={editForm.año}
                  onChange={(e) =>
                    setEditForm({ ...editForm, año: e.target.value })
                  }
                />
                {editErrors.año && (
                  <small className="error">{editErrors.año}</small>
                )}
              </div>
              <div className="col-4">
                <label>Capacidad de carga (kg)</label>
                <input
                  value={editForm.capacidad_carga}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      capacidad_carga: e.target.value,
                    })
                  }
                />
                {editErrors.capacidad_carga && (
                  <small className="error">{editErrors.capacidad_carga}</small>
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
