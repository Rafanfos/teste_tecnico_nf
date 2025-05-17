import { Request, Response, NextFunction, Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";

import {
  createInvoiceRequestSchema,
  getInvoiceRequestSchema,
  emitInvoiceSchema,
} from "../validators/invoice.validators";
import { validateRequest } from "../middlewares/invoice.middleware";

const invoiceRoutes = Router();
const invoiceController = new InvoiceController();

invoiceRoutes.post(
  "/",
  validateRequest(createInvoiceRequestSchema),
  (req: Request, res: Response, next: NextFunction) =>
    invoiceController.createInvoiceController(req, res, next)
);

invoiceRoutes.get("/", (req: Request, res: Response, next: NextFunction) =>
  invoiceController.listInvoiceController(req, res, next)
);

invoiceRoutes.get(
  "/:id",
  validateRequest(getInvoiceRequestSchema),
  (req: Request, res: Response, next: NextFunction) =>
    invoiceController.findInvoiceByIdController(req, res, next)
);

invoiceRoutes.post(
  "/:id/emit",
  validateRequest(emitInvoiceSchema),
  (req: Request, res: Response, next: NextFunction) =>
    invoiceController.emitInvoiceController(req, res, next)
);

export default invoiceRoutes;
