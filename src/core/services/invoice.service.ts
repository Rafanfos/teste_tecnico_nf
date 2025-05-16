import { InvoiceStatus } from "@prisma/client";
import {
  IExternalInvoiceService,
  IInvoiceCreateInput,
  IInvoiceEmissionPayload,
  IInvoiceEmissionSuccessResponse,
  IInvoiceOutput,
  IInvoiceRepository,
} from "../interfaces/invoice.interfaces";
import { InvoiceRepository } from "../repositories/invoice.repository";
import { DrFinancasClient } from "../../infra/http/drfinancas.client";

export class InvoiceService {
  private invoiceRepository: IInvoiceRepository;
  private externalInvoiceService: IExternalInvoiceService;

  constructor() {
    this.invoiceRepository = new InvoiceRepository();
    this.externalInvoiceService = new DrFinancasClient();
  }

  async createInvoiceService(
    data: IInvoiceCreateInput
  ): Promise<IInvoiceOutput> {
    return this.invoiceRepository.create(data);
  }

  async listInvoicesService(): Promise<IInvoiceOutput[]> {
    return this.invoiceRepository.findAll();
  }

  async findInvoiceByIdService(id: string): Promise<IInvoiceOutput | null> {
    return this.invoiceRepository.findById({ id });
  }

  async emitInvoiceService(invoiceRequestId: string): Promise<IInvoiceOutput> {
    const invoiceRequest = await this.invoiceRepository.findById({
      id: invoiceRequestId,
    });

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

      const updatedInvoiceRequest = await this.invoiceRepository.update({
        id: invoiceRequestId,
        data: {
          status: InvoiceStatus.EMITIDA,
          invoiceNumber: emissionResponse.invoiceNumber,
          invoiceIssueDate: new Date(emissionResponse.issueDate),
        },
      });

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

