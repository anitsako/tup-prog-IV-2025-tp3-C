import { body, param } from "express-validator";

export const vehiculoIdParam = [
  param("id").isInt({ min: 1 }).withMessage("id inválido").toInt(),
];

export const vehiculoCreateValidator = [
  body("marca").trim().notEmpty().withMessage("marca requerida"),
  body("modelo").trim().notEmpty().withMessage("modelo requerido"),
  body("patente")
    .trim()
    .matches(/^(?:[A-Z]{2}\d{3}[A-Z]{2}|[A-Z]{3}\d{3})$/)
    .withMessage("patente inválida (AA123BB o ABC123)")
    .customSanitizer((v) => v.toUpperCase()),
  body("año")
    .isInt({ min: 1960, max: new Date().getFullYear() + 1 })
    .withMessage("año inválido")
    .toInt(),
  body("capacidad_carga")
    .isFloat({ min: 0 })
    .withMessage("capacidad_carga inválida")
    .toFloat(),
];

export const vehiculoUpdateValidator = [
  ...vehiculoIdParam,
  ...vehiculoCreateValidator,
];
