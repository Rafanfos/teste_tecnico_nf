import {
  InvoiceStatus,
  InvoiceRequest as PrismaInvoiceRequest,
} from "@prisma/client";
import {
  IInvoiceRequestCreate,
  IInvoiceRequestRepository,
  IExternalInvoiceService,
  IInvoiceEmissionPayload,
  IInvoiceEmissionSuccessResponse,
} from "../interfaces/invoice.interfaces";
import { InvoiceRequestRepository } from "../repositories/invoice.repository";
import { DrFinancasClient } from "../../infra/http/drfinancas.client";

export class InvoiceService {
  private invoiceRepository: IInvoiceRequestRepository;
  private externalInvoiceService: IExternalInvoiceService;

  constructor() {
    this.invoiceRepository = new InvoiceRequestRepository();
    this.externalInvoiceService = new DrFinancasClient();
  }

  async createInvoiceRequest(
    data: IInvoiceRequestCreate
  ): Promise<PrismaInvoiceRequest> {
    return this.invoiceRepository.create(data);
  }

  async listInvoiceRequests(): Promise<PrismaInvoiceRequest[]> {
    return this.invoiceRepository.findAll();
  }

  async findInvoiceRequestById(
    id: string
  ): Promise<PrismaInvoiceRequest | null> {
    return this.invoiceRepository.findById(id);
  }

  async emitInvoice(invoiceRequestId: string): Promise<PrismaInvoiceRequest> {
    const invoiceRequest = await this.invoiceRepository.findById(
      invoiceRequestId
    );

    if (!invoiceRequest) {
      throw new Error("Solicitação não encontrada.");
    }

    if (invoiceRequest.status === InvoiceStatus.EMITIDA) {
      throw new Error("Nota Fiscal já emitida para esta solicitação.");
    }

    if (invoiceRequest.status === InvoiceStatus.CANCELADA) {
      throw new Error(
        "Não é possível emitir Nota Fiscal para uma solicitação cancelada."
      );
    }

    const payload: IInvoiceEmissionPayload = {
      takerCnpj: invoiceRequest.takerCnpj,
      serviceCity: invoiceRequest.serviceCity,
      serviceState: invoiceRequest.serviceState,
      serviceValue: invoiceRequest.serviceValue,
      desiredIssueDate: invoiceRequest.desiredIssueDate.toISOString(),
      serviceDescription: invoiceRequest.serviceDescription,
    };

    try {
      const emissionResponse: IInvoiceEmissionSuccessResponse =
        await this.externalInvoiceService.emitInvoice(payload);

      const updatedInvoiceRequest = await this.invoiceRepository.update(
        invoiceRequestId,
        {
          status: InvoiceStatus.EMITIDA,
          invoiceNumber: emissionResponse.invoiceNumber,
          invoiceIssueDate: new Date(emissionResponse.issueDate),
        }
      );

      if (!updatedInvoiceRequest) {
        throw new Error("Falha ao atualizar solicitação após emissão.");
      }
      return updatedInvoiceRequest;
    } catch (error: any) {
      console.error(
        "Erro no serviço ao tentar emitir nota fiscal:",
        error.message
      );
      throw new Error(`Falha ao emitir Nota Fiscal: ${error.message}`);
    }
  }
}

