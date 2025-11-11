import { validationResult } from "express-validator";
import { pool } from "../db.js";

export async function list(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, dni, licencia, licencia_vencimiento FROM conductores ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, dni, licencia, licencia_vencimiento FROM conductores WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Conductor no encontrado" });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { nombre, apellido, dni, licencia, licencia_vencimiento } = req.body;

    const [ex] = await pool.query("SELECT id FROM conductores WHERE dni = ?", [dni]);
    if (ex.length) return res.status(409).json({ message: "DNI ya registrado" });

    const [result] = await pool.query(
      "INSERT INTO conductores (nombre, apellido, dni, licencia, licencia_vencimiento) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellido, dni, licencia, licencia_vencimiento]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      dni,
      licencia,
      licencia_vencimiento,
    });
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
    const { nombre, apellido, dni, licencia, licencia_vencimiento } = req.body;

    const [ex] = await pool.query("SELECT id FROM conductores WHERE id = ?", [id]);
    if (!ex.length)
      return res.status(404).json({ message: "Conductor no encontrado" });

    if (dni) {
      const [dup] = await pool.query(
        "SELECT id FROM conductores WHERE dni = ? AND id <> ?",
        [dni, id]
      );
      if (dup.length) return res.status(409).json({ message: "DNI ya registrado" });
    }

    await pool.query(
      "UPDATE conductores SET nombre=?, apellido=?, dni=?, licencia=?, licencia_vencimiento=? WHERE id=?",
      [nombre, apellido, dni, licencia, licencia_vencimiento, id]
    );

    const [rows] = await pool.query(
      "SELECT * FROM conductores WHERE id = ? LIMIT 1",
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;

    const [ex] = await pool.query("SELECT id FROM conductores WHERE id = ?", [id]);
    if (!ex.length)
      return res.status(404).json({ message: "Conductor no encontrado" });

    await pool.query("DELETE FROM conductores WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
