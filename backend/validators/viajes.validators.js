import { body, query, param } from "express-validator";

export const viajeCreateValidator = [
  body("vehiculo_id").isInt({ min: 1 }).withMessage("vehiculo_id inválido"),
  body("conductor_id").isInt({ min: 1 }).withMessage("conductor_id inválido"),
  body("fecha_salida").isISO8601().withMessage("fecha_salida inválida"),
  body("fecha_llegada").isISO8601().withMessage("fecha_llegada inválida"),
  body("origen").trim().notEmpty().withMessage("origen requerido"),
  body("destino").trim().notEmpty().withMessage("destino requerido"),
  body("kilometros").isFloat({ min: 0 }).withMessage("kilometros inválido"),
  body("observaciones").optional().isString(),
];

export const viajesListFilters = [
  query("vehiculo_id").optional().isInt({ min: 1 }),
  query("conductor_id").optional().isInt({ min: 1 }),
];

export const viajeIdParam = [
  param("id").isInt({ min: 1 }).withMessage("id inválido"),
];

export const viajeUpdateValidator = [
  ...viajeCreateValidator,
];
