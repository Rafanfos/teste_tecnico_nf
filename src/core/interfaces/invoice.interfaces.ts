import { InvoiceModel } from "@prisma/client";

export interface IInvoiceCreateInput {
  takerCnpj: string;
  serviceCity: string;
  serviceState: string;
  serviceValue: number;
  desiredIssueDate: Date;
  serviceDescription: string;
}

export interface IInvoiceFindByIdInput {
  id: string;
}

export interface IInvoiceUpdateInput {
  id: string;
  data: Partial<Omit<InvoiceModel, "id" | "createdAt">>;
}

export interface IInvoiceOutput extends InvoiceModel {}

export interface IInvoiceRepository {
  create(input: IInvoiceCreateInput): Promise<IInvoiceOutput>;
  findAll(): Promise<IInvoiceOutput[]>;
  findById(input: IInvoiceFindByIdInput): Promise<IInvoiceOutput | null>;
  update(input: IInvoiceUpdateInput): Promise<IInvoiceOutput | null>;
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
  numeroNF: string;
  dataEmissao: string;
}

export interface IExternalInvoiceService {
  emitInvoice(
    payload: IInvoiceEmissionPayload
  ): Promise<IInvoiceEmissionSuccessResponse>;
}
