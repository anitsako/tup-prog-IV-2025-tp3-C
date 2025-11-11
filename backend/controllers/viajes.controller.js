import { validationResult } from "express-validator";
import { pool } from "../db.js";

function buildWhere(filters = {}) {
  const clauses = [];
  const params = [];
  if (filters.vehiculo_id) {
    clauses.push("vehiculo_id = ?");
    params.push(Number(filters.vehiculo_id));
  }
  if (filters.conductor_id) {
    clauses.push("conductor_id = ?");
    params.push(Number(filters.conductor_id));
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
}

export async function list(req, res, next) {
  try {
    const { where, params } = buildWhere(req.query);
    const [rows] = await pool.query(
      `SELECT id, vehiculo_id, conductor_id, fecha_salida, fecha_llegada,
              origen, destino, kilometros, observaciones
       FROM viajes
       ${where}
       ORDER BY fecha_salida DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function totalKm(req, res, next) {
  try {
    const { where, params } = buildWhere(req.query);
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(kilometros), 0) AS total_km
       FROM viajes
       ${where}`,
      params
    );
    res.json({ total_km: Number(rows[0]?.total_km || 0) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones = null,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO viajes
        (vehiculo_id, conductor_id, fecha_salida, fecha_llegada,
         origen, destino, kilometros, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(vehiculo_id),
        Number(conductor_id),
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        Number(kilometros),
        observaciones,
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const {
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones = null,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE viajes
         SET vehiculo_id = ?,
             conductor_id = ?,
             fecha_salida = ?,
             fecha_llegada = ?,
             origen = ?,
             destino = ?,
             kilometros = ?,
             observaciones = ?
       WHERE id = ?`,
      [
        Number(vehiculo_id),
        Number(conductor_id),
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        Number(kilometros),
        observaciones,
        Number(id),
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Recurso no encontrado" });

    res.json({ id: Number(id), message: "Viaje actualizado" });
  } catch (err) {
    next(err);
  }
}
