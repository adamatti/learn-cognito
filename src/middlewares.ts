import type { NextFunction, Request, Response } from "express";
import logger from "./logger";

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.debug("Http call", {
    method: req.method,
    url: req.url,
    // headers: req.headers,
  });
  next();
};
