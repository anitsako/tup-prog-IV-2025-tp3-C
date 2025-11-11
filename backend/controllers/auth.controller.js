import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { nombre, email, password } = req.body;

    const [ex] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );
    if (ex.length) return res.status(409).json({ message: "Email ya registrado" });

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)",
      [nombre, email, hash]
    );

    return res.status(201).json({ id: result.insertId, nombre, email });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ message: "Credenciales inválidas" });

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ message: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );
    
    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}
