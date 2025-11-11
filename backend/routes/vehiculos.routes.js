import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  list, getById, create, update, remove
} from "../controllers/vehiculos.controller.js";
import {
  vehiculoCreateValidator,
  vehiculoUpdateValidator,
  vehiculoIdParam
} from "../validators/vehiculos.validators.js";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.get("/:id", vehiculoIdParam, validate, getById);
router.post("/", vehiculoCreateValidator, validate, create);
router.put("/:id", vehiculoIdParam, vehiculoUpdateValidator, validate, update);
router.delete("/:id", vehiculoIdParam, validate, remove);

export default router;
