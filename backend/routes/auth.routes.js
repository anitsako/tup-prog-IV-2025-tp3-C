import { Router } from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/auth.controller.js';
import { validate } from "../middleware/validate.js";


const router = Router();

router.post(
  '/register',
  [
    body('nombre').trim().notEmpty().withMessage('Nombre obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña obligatoria')
  ],
  validate,
  login
);

export default router;
