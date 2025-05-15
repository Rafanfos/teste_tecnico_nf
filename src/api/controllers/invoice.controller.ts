import { Request, Response, NextFunction } from "express";

import { IInvoiceRequestCreate } from "../../core/interfaces/invoice.interfaces"; // Updated import path and interface name
import { InvoiceService } from "../../core/services/invoice.service";

export class InvoiceController {
  private invoiceService: InvoiceService;

  constructor() {
    this.invoiceService = new InvoiceService();
  }

  async createInvoiceRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const createData = req.body as IInvoiceRequestCreate;
      const invoiceRequest = await this.invoiceService.createInvoiceRequest({
        ...createData,
        desiredIssueDate: new Date(createData.desiredIssueDate),
      });
      res.status(201).json(invoiceRequest);
    } catch (error) {
      next(error);
    }
  }

  async listInvoiceRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const invoiceRequests = await this.invoiceService.listInvoiceRequests(); // Calling updated service method
      res.status(200).json(invoiceRequests);
    } catch (error) {
      next(error);
    }
  }

  async findInvoiceRequestById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const invoiceRequest = await this.invoiceService.findInvoiceRequestById(
        id
      );
      if (!invoiceRequest) {
        res.status(404).json({ message: "Solicitação não encontrada." }); // User-facing message, kept in Portuguese
        return;
      }
      res.status(200).json(invoiceRequest);
    } catch (error) {
      next(error);
    }
  }

  async emitInvoice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const issuedInvoice = await this.invoiceService.emitInvoice(id); // Calling updated service method
      res.status(200).json(issuedInvoice);
    } catch (error: any) {
      if (error.message.includes("Solicitação não encontrada")) {
        res.status(404).json({ message: error.message });
      } else if (
        error.message.includes("Nota Fiscal já emitida") ||
        error.message.includes("solicitação cancelada")
      ) {
        res.status(400).json({ message: error.message });
      } else if (error.message.startsWith("API Externa: 400")) {
        res.status(400).json({
          message: "Erro na solicitação à API externa (400).",
          details: error.message,
        });
      } else if (error.message.startsWith("API Externa: 401")) {
        res.status(401).json({
          message: "Erro de autenticação com a API externa (401).",
          details: error.message,
        });
      } else if (error.message.startsWith("API Externa: 500")) {
        res.status(500).json({
          message: "Erro interno na API externa (500).",
          details: error.message,
        });
      } else {
        next(error);
      }
    }
  }
}
