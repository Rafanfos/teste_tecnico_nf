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

/**
 * @swagger
 * /:
 *   post:
 *     tags: [InvoiceRequests]
 *     summary: Creates a new invoice request
 *     description: Creates a new request for a fiscal invoice.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/IInvoiceRequestCreate"
 *     responses:
 *       "201":
 *         description: Invoice request created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InvoiceRequest"
 *       "400":
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
invoiceRoutes.post(
  "/",
  validateRequest(createInvoiceRequestSchema),
  (req: Request, res: Response, next: NextFunction) =>
    invoiceController.createInvoiceRequest(req, res, next)
);

/**
 * @swagger
 * /:
 *   get:
 *     tags: [InvoiceRequests]
 *     summary: Lists all invoice requests
 *     description: Retrieves a list of all existing invoice requests.
 *     responses:
 *       "200":
 *         description: A list of invoice requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/InvoiceRequest"
 */
invoiceRoutes.get("/", (req: Request, res: Response, next: NextFunction) =>
  invoiceController.listInvoiceRequests(req, res, next)
);

/**
 * @swagger
 * /{id}:
 *   get:
 *     tags: [InvoiceRequests]
 *     summary: Finds an invoice request by ID
 *     description: Retrieves a specific invoice request by its unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Unique ID of the invoice request.
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       "200":
 *         description: Details of the invoice request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InvoiceRequest"
 *       "404":
 *         description: Invoice request not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
invoiceRoutes.get(
  "/:id",
  validateRequest(getInvoiceRequestSchema),
  (req: Request, res: Response, next: NextFunction) =>
    invoiceController.findInvoiceRequestById(req, res, next)
);

/**
 * @swagger
 * /{id}/emit:
 *   post:
 *     tags: [InvoiceRequests]
 *     summary: Emits an invoice for an existing request
 *     description: Triggers the emission of a fiscal invoice for a given invoice request ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Unique ID of the invoice request to emit.
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       "200":
 *         description: Invoice emitted successfully and request updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InvoiceRequest"
 *       "400":
 *         description: Bad request (e.g., invoice already emitted, request cancelled, error from external API).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "401":
 *         description: Authentication error with the external API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "404":
 *         description: Invoice request not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "500":
 *         description: Internal server error or error from external API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
invoiceRoutes.post(
  "/:id/emit",
  validateRequest(emitInvoiceSchema),
  (req: Request, res: Response, next: NextFunction) =>
    invoiceController.emitInvoice(req, res, next)
);

export default invoiceRoutes;
