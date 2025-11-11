import { useEffect, useRef, useState } from "react";
import api from "../api.js";

function toMySQLDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d) ? "" : d.toISOString().slice(0, 19).replace("T", " ");
}

export default function Viajes() {
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [items, setItems] = useState([]);
  const [totalKm, setTotalKm] = useState(0);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");

  // filtros
  const [filterVehiculo, setFilterVehiculo] = useState("");
  const [filterConductor, setFilterConductor] = useState("");

  // alta
  const [form, setForm] = useState({
    vehiculo_id: "",
    conductor_id: "",
    fecha_salida: "",
    fecha_llegada: "",
    origen: "",
    destino: "",
    kilometros: "",
    observaciones: "",
  });
  const [errors, setErrors] = useState({});

  // edición
  const editRef = useRef();
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    vehiculo_id: "",
    conductor_id: "",
    fecha_salida: "",
    fecha_llegada: "",
    origen: "",
    destino: "",
    kilometros: "",
    observaciones: "",
  });
  const [editErrors, setEditErrors] = useState({});

  async function loadOptions() {
    const [v, c] = await Promise.all([api.get("/vehiculos"), api.get("/conductores")]);
    setVehiculos(v);
    setConductores(c);
  }

  async function loadList() {
    const params = new URLSearchParams();
    if (filterVehiculo) params.set("vehiculo_id", filterVehiculo);
    if (filterConductor) params.set("conductor_id", filterConductor);
    const qs = params.toString() ? `?${params}` : "";
    const [list, total] = await Promise.all([
      api.get(`/viajes${qs}`),
      api.get(`/viajes/total-km${qs}`),
    ]);
    setItems(list);
    setTotalKm(total.total_km ?? 0);
  }

  useEffect(() => {
    loadOptions().then(loadList).catch((e) => setMsg(e.message));
  }, []);

  useEffect(() => {
    loadList().catch((e) => setMsg(e.message));
  }, [filterVehiculo, filterConductor]);

  function validate(data, setErr) {
    const e = {};
    if (!data.vehiculo_id) e.vehiculo_id = "Obligatorio";
    if (!data.conductor_id) e.conductor_id = "Obligatorio";
    if (!data.fecha_salida) e.fecha_salida = "Obligatorio";
    if (!data.fecha_llegada) e.fecha_llegada = "Obligatorio";
    if (!data.origen.trim()) e.origen = "Obligatorio";
    if (!data.destino.trim()) e.destino = "Obligatorio";
    if (isNaN(Number(data.kilometros)) || Number(data.kilometros) <= 0)
      e.kilometros = "Número > 0";
    setErr(e);
    return Object.keys(e).length === 0;
  }

  // alta
  async function onSubmit(ev) {
    ev.preventDefault();
    if (!validate(form, setErrors)) return;
    try {
      await api.post("/viajes", {
        ...form,
        vehiculo_id: Number(form.vehiculo_id),
        conductor_id: Number(form.conductor_id),
        fecha_salida: toMySQLDateTime(form.fecha_salida),
        fecha_llegada: toMySQLDateTime(form.fecha_llegada),
        kilometros: Number(form.kilometros),
      });
      setForm({
        vehiculo_id: "",
        conductor_id: "",
        fecha_salida: "",
        fecha_llegada: "",
        origen: "",
        destino: "",
        kilometros: "",
        observaciones: "",
      });
      setErrors({});
      loadList();
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function onDelete(id) {
    if (!confirm("¿Eliminar viaje?")) return;
    try {
      // await api.del(`/viajes/${id}`);
      alert("Para borrar, implementá DELETE en el backend (si querés).");
    } catch (e) {
      alert(e.message);
    }
  }

  function openEdit(v) {
    setEditItem(v);
    setEditForm({
      vehiculo_id: String(v.vehiculo_id),
      conductor_id: String(v.conductor_id),
      fecha_salida: v.fecha_salida ? v.fecha_salida.replace(" ", "T").slice(0, 16) : "",
      fecha_llegada: v.fecha_llegada ? v.fecha_llegada.replace(" ", "T").slice(0, 16) : "",
      origen: v.origen ?? "",
      destino: v.destino ?? "",
      kilometros: v.kilometros ?? "",
      observaciones: v.observaciones ?? "",
    });
    setEditErrors({});
    editRef.current.showModal();
  }

  async function onUpdate(ev) {
    ev.preventDefault();
    if (!validate(editForm, setEditErrors)) return;
    try {
      await api.put(`/viajes/${editItem.id}`, {
        ...editForm,
        vehiculo_id: Number(editForm.vehiculo_id),
        conductor_id: Number(editForm.conductor_id),
        fecha_salida: toMySQLDateTime(editForm.fecha_salida),
        fecha_llegada: toMySQLDateTime(editForm.fecha_llegada),
        kilometros: Number(editForm.kilometros),
      });
      editRef.current.close();
      setEditItem(null);
      loadList();
    } catch (e) {
      alert(e.message);
    }
  }

  const filtered = items.filter((v) =>
    !q
      ? true
      : (v.origen + v.destino + (v.conductor_apellido || "") + (v.vehiculo_patente || ""))
          .toLowerCase()
          .includes(q.toLowerCase())
  );

  return (
    <section className="section">
      <div className="card">
        <header>
          <h3 className="title">Viajes</h3>
        </header>
          {/* Form alta */}
          <form onSubmit={onSubmit} noValidate className="form-grid">
            <div className="col-6">
              <label>Vehículo</label>
              <select
                value={form.vehiculo_id}
                onChange={(e) => setForm({ ...form, vehiculo_id: e.target.value })}
              >
                <option value="">Seleccioná…</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.patente}
                  </option>
                ))}
              </select>
              {errors.vehiculo_id && <small className="error">{errors.vehiculo_id}</small>}
            </div>

            <div className="col-6">
              <label>Conductor</label>
              <select
                value={form.conductor_id}
                onChange={(e) => setForm({ ...form, conductor_id: e.target.value })}
              >
                <option value="">Seleccioná…</option>
                {conductores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.apellido}, {c.nombre}
                  </option>
                ))}
              </select>
              {errors.conductor_id && <small className="error">{errors.conductor_id}</small>}
            </div>

            <div className="col-6">
              <label>Salida</label>
              <input
                type="datetime-local"
                value={form.fecha_salida}
                onChange={(e) => setForm({ ...form, fecha_salida: e.target.value })}
              />
              {errors.fecha_salida && <small className="error">{errors.fecha_salida}</small>}
            </div>

            <div className="col-6">
              <label>Llegada</label>
              <input
                type="datetime-local"
                value={form.fecha_llegada}
                onChange={(e) => setForm({ ...form, fecha_llegada: e.target.value })}
              />
              {errors.fecha_llegada && <small className="error">{errors.fecha_llegada}</small>}
            </div>

            <div className="col-6">
              <label>Origen</label>
              <input
                value={form.origen}
                onChange={(e) => setForm({ ...form, origen: e.target.value })}
              />
              {errors.origen && <small className="error">{errors.origen}</small>}
            </div>

            <div className="col-6">
              <label>Destino</label>
              <input
                value={form.destino}
                onChange={(e) => setForm({ ...form, destino: e.target.value })}
              />
              {errors.destino && <small className="error">{errors.destino}</small>}
            </div>

            <div className="col-4">
              <label>Kilómetros</label>
              <input
                value={form.kilometros}
                onChange={(e) => setForm({ ...form, kilometros: e.target.value })}
              />
              {errors.kilometros && <small className="error">{errors.kilometros}</small>}
            </div>

            <div className="col-12">
              <label>Observaciones</label>
              <textarea
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              />
            </div>

            <div className="col-12 flex right">
              <button className="btn">Guardar viaje</button>
            </div>
          </form>

          <div className="content">
          {/* Toolbar */}
          <div className="toolbar">
            <div className="search">
              <input
                placeholder="Buscar por destino, vehículo o conductor…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button className="btn icon" onClick={loadList}>
              Cargar datos
            </button>
          </div>

          {/* Filtros */}
          <div className="toolbar mt-2">
            <label>
              Vehículo
              <select
                value={filterVehiculo}
                onChange={(e) => setFilterVehiculo(e.target.value)}
              >
                <option value="">Todos</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.patente}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Conductor
              <select
                value={filterConductor}
                onChange={(e) => setFilterConductor(e.target.value)}
              >
                <option value="">Todos</option>
                {conductores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.apellido}, {c.nombre}
                  </option>
                ))}
              </select>
            </label>

            <p>
              <b>Total km:</b> {Number(totalKm).toLocaleString()}
            </p>
          </div>

          {/* Tabla */}
          <div className="table-wrap mt-2">
            {filtered.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No hay registros.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Salida</th>
                    <th>Vehículo</th>
                    <th>Conductor</th>
                    <th>Origen → Destino</th>
                    <th>Km</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id}>
                      <td>{(v.fecha_salida || "").replace("T", " ").slice(0, 16)}</td>
                      <td>{v.vehiculo_patente || v.vehiculo_id}</td>
                      <td>
                        {v.conductor_apellido
                          ? `${v.conductor_apellido}, ${v.conductor_nombre}`
                          : v.conductor_id}
                      </td>
                      <td>
                        {v.origen} → {v.destino}
                      </td>
                      <td>{Number(v.kilometros).toLocaleString()}</td>
                      <td className="actions">
                        <button className="btn ghost" onClick={() => openEdit(v)}>
                          Editar
                        </button>
                        <button className="btn secondary" onClick={() => onDelete(v.id)}>
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
          <h3>Editar viaje</h3>
          {editItem && (
            <form onSubmit={onUpdate} noValidate className="form-grid mt-2">
              <div className="col-6">
                <label>Vehículo</label>
                <select
                  value={editForm.vehiculo_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, vehiculo_id: e.target.value })
                  }
                >
                  <option value="">Seleccioná…</option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.patente}
                    </option>
                  ))}
                </select>
                {editErrors.vehiculo_id && (
                  <small className="error">{editErrors.vehiculo_id}</small>
                )}
              </div>

              <div className="col-6">
                <label>Conductor</label>
                <select
                  value={editForm.conductor_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, conductor_id: e.target.value })
                  }
                >
                  <option value="">Seleccioná…</option>
                  {conductores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.apellido}, {c.nombre}
                    </option>
                  ))}
                </select>
                {editErrors.conductor_id && (
                  <small className="error">{editErrors.conductor_id}</small>
                )}
              </div>

              <div className="col-6">
                <label>Salida</label>
                <input
                  type="datetime-local"
                  value={editForm.fecha_salida}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fecha_salida: e.target.value })
                  }
                />
                {editErrors.fecha_salida && (
                  <small className="error">{editErrors.fecha_salida}</small>
                )}
              </div>

              <div className="col-6">
                <label>Llegada</label>
                <input
                  type="datetime-local"
                  value={editForm.fecha_llegada}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fecha_llegada: e.target.value })
                  }
                />
                {editErrors.fecha_llegada && (
                  <small className="error">{editErrors.fecha_llegada}</small>
                )}
              </div>

              <div className="col-6">
                <label>Origen</label>
                <input
                  value={editForm.origen}
                  onChange={(e) =>
                    setEditForm({ ...editForm, origen: e.target.value })
                  }
                />
                {editErrors.origen && (
                  <small className="error">{editErrors.origen}</small>
                )}
              </div>

              <div className="col-6">
                <label>Destino</label>
                <input
                  value={editForm.destino}
                  onChange={(e) =>
                    setEditForm({ ...editForm, destino: e.target.value })
                  }
                />
                {editErrors.destino && (
                  <small className="error">{editErrors.destino}</small>
                )}
              </div>

              <div className="col-4">
                <label>Kilómetros</label>
                <input
                  value={editForm.kilometros}
                  onChange={(e) =>
                    setEditForm({ ...editForm, kilometros: e.target.value })
                  }
                />
                {editErrors.kilometros && (
                  <small className="error">{editErrors.kilometros}</small>
                )}
              </div>

              <div className="col-12">
                <label>Observaciones</label>
                <textarea
                  value={editForm.observaciones}
                  onChange={(e) =>
                    setEditForm({ ...editForm, observaciones: e.target.value })
                  }
                />
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
