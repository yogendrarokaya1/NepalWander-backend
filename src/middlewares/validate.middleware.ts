import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { BadRequestError } from "./error.middleware";

const validate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    throw new BadRequestError(message);
  }
  next();
};

export default validate;