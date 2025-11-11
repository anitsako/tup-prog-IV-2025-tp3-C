import { body, param } from "express-validator";

export const conductorIdParam = [
  param("id").isInt({ min: 1 }).withMessage("id inválido"),
];

export const conductorCreateValidator = [
  body("nombre").trim().notEmpty().withMessage("nombre requerido"),
  body("apellido").trim().notEmpty().withMessage("apellido requerido"),
  body("dni").trim().notEmpty().withMessage("dni requerido"),
  body("licencia").trim().notEmpty().withMessage("licencia requerida"),
  body("licencia_vencimiento").isISO8601().withMessage("licencia_vencimiento inválida"),
];

export const conductorUpdateValidator = [
  ...conductorIdParam,
  ...conductorCreateValidator,
];
