import { Router } from "express";
import { list, totalKm, create, update } from "../controllers/viajes.controller.js";
import {
  viajeCreateValidator,
  viajesListFilters,
  viajeIdParam,
  viajeUpdateValidator,
} from "../validators/viajes.validators.js";
import { requireAuth } from "../middleware/auth.js";


const router = Router();

router.get("/", viajesListFilters, list);
router.get("/total-km", viajesListFilters, totalKm);
router.post("/", viajeCreateValidator, create);
router.put("/:id", viajeIdParam, viajeUpdateValidator, update);

export default router;
