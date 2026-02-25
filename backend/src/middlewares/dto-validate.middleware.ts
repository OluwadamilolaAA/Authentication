import { plainToInstance, type ClassConstructor } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

type ValidationDetail = {
  field: string;
  messages: string[];
};

export const validateDto = <T extends object>(DtoClass: ClassConstructor<T>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(DtoClass, req.body) as T;
    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const details: ValidationDetail[] = errors.map((error) => ({
        field: error.property,
        messages: Object.values(error.constraints ?? {}),
      }));
      return next(
        ApiError.badRequest("Validation failed", "VALIDATION_ERROR", details)
      );
    }

    req.body = dtoInstance;
    next();
  };
};
