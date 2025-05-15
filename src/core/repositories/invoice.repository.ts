import {
  PrismaClient,
  InvoiceRequest as PrismaInvoiceRequest,
  StatusNotaFiscal,
} from "@prisma/client";
import {
  IInvoiceRequestCreate,
  IInvoiceRequestRepository,
} from "../interfaces/invoice.interfaces";
import prisma from "../../infra/database/prisma";

export class InvoiceRequestRepository implements IInvoiceRequestRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: IInvoiceRequestCreate): Promise<PrismaInvoiceRequest> {
    return this.prisma.invoiceRequest.create({
      data: {
        takerCnpj: data.takerCnpj,
        serviceCity: data.serviceCity,
        serviceState: data.serviceState,
        serviceValue: data.serviceValue,
        desiredIssueDate: data.desiredIssueDate,
        serviceDescription: data.serviceDescription,
        status: StatusNotaFiscal.PENDENTE_EMISSAO, // Status inicial definido aqui, mantido em português
      },
    });
  }

  async findAll(): Promise<PrismaInvoiceRequest[]> {
    return this.prisma.invoiceRequest.findMany();
  }

  async findById(id: string): Promise<PrismaInvoiceRequest | null> {
    return this.prisma.invoiceRequest.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Partial<Omit<PrismaInvoiceRequest, "id" | "createdAt">>
  ): Promise<PrismaInvoiceRequest | null> {
    return this.prisma.invoiceRequest.update({
      where: { id },
      data,
    });
  }
}

