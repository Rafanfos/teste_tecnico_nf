import { InvoiceStatus, PrismaClient } from "@prisma/client";
import {
  IInvoiceCreateInput,
  IInvoiceFindByIdInput,
  IInvoiceOutput,
  IInvoiceRepository,
  IInvoiceUpdateInput,
} from "../interfaces/invoice.interfaces";
import prisma from "../../infra/database/prisma";

export class InvoiceRepository implements IInvoiceRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: IInvoiceCreateInput): Promise<IInvoiceOutput> {
    return this.prisma.invoiceModel.create({
      data: {
        takerCnpj: data.takerCnpj,
        serviceCity: data.serviceCity,
        serviceState: data.serviceState,
        serviceValue: data.serviceValue,
        desiredIssueDate: data.desiredIssueDate,
        serviceDescription: data.serviceDescription,
        status: InvoiceStatus.PENDENTE_EMISSAO,
      },
    });
  }

  async findAll(): Promise<IInvoiceOutput[]> {
    return this.prisma.invoiceModel.findMany();
  }

  async findById({
    id,
  }: IInvoiceFindByIdInput): Promise<IInvoiceOutput | null> {
    return this.prisma.invoiceModel.findUnique({
      where: { id },
    });
  }

  async update({
    id,
    data,
  }: IInvoiceUpdateInput): Promise<IInvoiceOutput | null> {
    return this.prisma.invoiceModel.update({
      where: { id },
      data,
    });
  }
}

