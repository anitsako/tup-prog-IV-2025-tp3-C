import { body } from "express-validator";

export const registerValidator = [
  body("nombre").trim().notEmpty().withMessage("nombre requerido"),
  body("email").isEmail().withMessage("email inválido").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("password >= 6"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("email inválido").normalizeEmail(),
  body("password").notEmpty().withMessage("password requerido"),
];
