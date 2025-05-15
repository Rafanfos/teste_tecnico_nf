import {
  InvoiceRequest as PrismaInvoiceRequest,
  StatusNotaFiscal,
} from "@prisma/client";

export interface IInvoiceRequestCreate {
  takerCnpj: string;
  serviceCity: string;
  serviceState: string;
  serviceValue: number;
  desiredIssueDate: Date;
  serviceDescription: string;
}

export interface IInvoiceRequestUpdate {
  status?: StatusNotaFiscal;
  invoiceNumber?: string;
  invoiceIssueDate?: Date;
}

export interface IInvoiceRequestRepository {
  create(data: IInvoiceRequestCreate): Promise<PrismaInvoiceRequest>;
  findAll(): Promise<PrismaInvoiceRequest[]>;
  findById(id: string): Promise<PrismaInvoiceRequest | null>;
  update(
    id: string,
    data: Partial<PrismaInvoiceRequest>
  ): Promise<PrismaInvoiceRequest | null>;
}

export interface IInvoiceEmissionPayload {
  takerCnpj: string;
  serviceCity: string;
  serviceState: string;
  serviceValue: number;
  desiredIssueDate: string;
  serviceDescription: string;
}

export interface IInvoiceEmissionSuccessResponse {
  invoiceNumber: string;
  issueDate: string;
}

export interface IExternalInvoiceService {
  emitInvoice(
    payload: IInvoiceEmissionPayload
  ): Promise<IInvoiceEmissionSuccessResponse>;
}
