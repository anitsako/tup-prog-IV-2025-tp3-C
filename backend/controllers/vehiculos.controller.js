import { validationResult, matchedData } from "express-validator";
import { pool } from "../db.js";

export async function list(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT id, marca, modelo, patente, `año` AS año, capacidad_carga FROM vehiculos ORDER BY id DESC"
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

    const { id } = matchedData(req, { locations: ["params"] });
    const [rows] = await pool.query(
      "SELECT id, marca, modelo, patente, `año` AS año, capacidad_carga FROM vehiculos WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Vehículo no encontrado" });
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

    const data = matchedData(req, { locations: ["body"] });
    const { marca, modelo, patente } = data;
    const año = data["año"];
    const capacidad_carga = data["capacidad_carga"];

    const [ex] = await pool.query(
      "SELECT id FROM vehiculos WHERE patente = ? LIMIT 1",
      [patente]
    );
    if (ex.length) return res.status(409).json({ message: "Patente ya registrada" });

    const [result] = await pool.query(
      "INSERT INTO vehiculos (marca, modelo, patente, `año`, capacidad_carga) VALUES (?, ?, ?, ?, ?)",
      [marca, modelo, patente, año, capacidad_carga]
    );

    res.status(201).json({
      id: result.insertId,
      marca,
      modelo,
      patente,
      año,
      capacidad_carga,
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

    const { id } = matchedData(req, { locations: ["params"] });
    const body = matchedData(req, { locations: ["body"] });

    const [exId] = await pool.query(
      "SELECT id FROM vehiculos WHERE id = ? LIMIT 1",
      [id]
    );
    if (!exId.length) return res.status(404).json({ message: "Vehículo no encontrado" });

    if (body.patente) {
      const [exPat] = await pool.query(
        "SELECT id FROM vehiculos WHERE patente = ? AND id <> ? LIMIT 1",
        [body.patente, id]
      );
      if (exPat.length) return res.status(409).json({ message: "Patente ya registrada" });
    }

    const fields = [];
    const values = [];
    const allowed = ["marca", "modelo", "patente", "año", "capacidad_carga"];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        if (key === "año") {
          fields.push("`año` = ?");
          values.push(body[key]);
        } else {
          fields.push(`${key} = ?`);
          values.push(body[key]);
        }
      }
    }

    if (!fields.length) return res.status(400).json({ message: "Nada para actualizar" });

    values.push(id);
    const sql = `UPDATE vehiculos SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(sql, values);

    const [rows] = await pool.query(
      "SELECT id, marca, modelo, patente, `año` AS año, capacidad_carga FROM vehiculos WHERE id = ? LIMIT 1",
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

    const { id } = matchedData(req, { locations: ["params"] });

    const [ex] = await pool.query(
      "SELECT id FROM vehiculos WHERE id = ? LIMIT 1",
      [id]
    );
    if (!ex.length) return res.status(404).json({ message: "Vehículo no encontrado" });

    await pool.query("DELETE FROM vehiculos WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
