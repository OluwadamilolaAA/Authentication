import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({ message: "Internal server error" });
  }

  return res.status(500).json({ message: "Internal server error" });
};
