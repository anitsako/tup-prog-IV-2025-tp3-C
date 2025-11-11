import { validationResult, matchedData } from "express-validator";

export function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  
  req.data = matchedData(req, { locations: ["body", "params", "query"] });
  next();
}
