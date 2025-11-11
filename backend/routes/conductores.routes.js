import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  list, getById, create, update, remove
} from "../controllers/conductores.controller.js";
import {
  conductorCreateValidator,
  conductorUpdateValidator,
  conductorIdParam
} from "../validators/conductores.validators.js";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.get("/:id", conductorIdParam, validate, getById);
router.post("/", conductorCreateValidator, validate, create);
router.put("/:id", conductorIdParam, conductorUpdateValidator, validate, update);
router.delete("/:id", conductorIdParam, validate, remove);

export default router;
