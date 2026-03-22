import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const validarBody = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "validation-error",
          error: error.issues.map((err) => ({
            field: err.path[0] as string,
            message: err.message,
          })),
        });
      }

      return next(error);
    }
  };
};
