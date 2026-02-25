import type { Response, NextFunction, RequestHandler } from "express";
import { AuthRequest } from "./auth.middleware";
import { ApiError } from "../utils/apiError";

export const authorizeRoles = (...roles: Array<"user" | "admin">) => {
  const handler: RequestHandler = (req, _res, next) => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !("role" in authReq.user)) {
      return next(ApiError.unauthorized("Unauthorized"));
    }

    if (!roles.includes(authReq.user.role as "user" | "admin")) {
      return next(ApiError.forbidden("Forbidden"));
    }

    next();
  };
  return handler;
};
