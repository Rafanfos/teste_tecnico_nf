import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    schema
      .parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      .then(() => {
        next();
      })
      .catch((error) => {
        if (error instanceof ZodError) {
          res.status(400).json({
            message: "Erro de validação",
            errors: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          });
          return;
        }

        res
          .status(500)
          .json({ message: "Erro interno no servidor durante a validação." });
      });
  };
