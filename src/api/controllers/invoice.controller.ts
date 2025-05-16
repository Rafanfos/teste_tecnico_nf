import { Request, Response, NextFunction } from "express";

import { InvoiceService } from "../../core/services/invoice.service";
import { IInvoiceCreateInput } from "../../core/interfaces/invoice.interfaces";

export class InvoiceController {
  private invoiceService: InvoiceService;

  constructor() {
    this.invoiceService = new InvoiceService();
  }

  async createInvoiceController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const createData = req.body as IInvoiceCreateInput;
      const invoiceRequest = await this.invoiceService.createInvoiceService({
        ...createData,
        desiredIssueDate: new Date(createData.desiredIssueDate),
      });
      res.status(201).json(invoiceRequest);
    } catch (error) {
      next(error);
    }
  }

  async listInvoiceController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const invoiceRequests = await this.invoiceService.listInvoicesService();
      res.status(200).json(invoiceRequests);
    } catch (error) {
      next(error);
    }
  }

  async findInvoiceByIdController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const invoiceRequest = await this.invoiceService.findInvoiceByIdService(
        id
      );
      if (!invoiceRequest) {
        res.status(404).json({ message: "Solicitação não encontrada." });
        return;
      }
      res.status(200).json(invoiceRequest);
    } catch (error) {
      next(error);
    }
  }

  async emitInvoiceController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const issuedInvoice = await this.invoiceService.emitInvoiceService(id);
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
