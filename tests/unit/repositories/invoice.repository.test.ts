import { PrismaClient, InvoiceStatus } from "@prisma/client";
import { InvoiceRepository } from "../../../src/core/repositories/invoice.repository";
import { IInvoiceCreateInput, IInvoiceOutput } from "../../../src/core/interfaces/invoice.interfaces";

// Mock do Prisma Client
const mockPrismaInvoiceModel = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn()
};

// Mock do Prisma Client
const mockPrisma = {
  invoiceModel: mockPrismaInvoiceModel
};

// Mock do módulo prisma
jest.mock("../../../src/infra/database/prisma", () => {
  return {
    __esModule: true,
    default: mockPrisma
  };
});

describe("InvoiceRepository", () => {
  let invoiceRepository: InvoiceRepository;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    invoiceRepository = new InvoiceRepository();
  });

  describe("create", () => {
    it("deve criar uma solicitação de nota fiscal com sucesso", async () => {
      // Arrange
      const mockData: IInvoiceCreateInput = {
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: new Date(),
        serviceDescription: "Serviço de desenvolvimento"
      };

      const mockCreatedInvoice: IInvoiceOutput = {
        id: "invoice-id-1",
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: new Date(),
        serviceDescription: "Serviço de desenvolvimento",
        status: InvoiceStatus.PENDENTE_EMISSAO,
        createdAt: new Date(),
        updatedAt: new Date(),
        invoiceNumber: null,
        invoiceIssueDate: null
      };

      mockPrismaInvoiceModel.create.mockResolvedValue(mockCreatedInvoice);

      // Act
      const result = await invoiceRepository.create(mockData);

      // Assert
      expect(mockPrismaInvoiceModel.create).toHaveBeenCalledWith({
        data: {
          takerCnpj: mockData.takerCnpj,
          serviceCity: mockData.serviceCity,
          serviceState: mockData.serviceState,
          serviceValue: mockData.serviceValue,
          desiredIssueDate: mockData.desiredIssueDate,
          serviceDescription: mockData.serviceDescription,
          status: InvoiceStatus.PENDENTE_EMISSAO
        }
      });
      expect(result).toEqual(mockCreatedInvoice);
    });
  });

  describe("findAll", () => {
    it("deve listar todas as solicitações de nota fiscal", async () => {
      // Arrange
      const mockInvoices: IInvoiceOutput[] = [
        {
          id: "invoice-id-1",
          takerCnpj: "12345678000190",
          serviceCity: "São Paulo",
          serviceState: "SP",
          serviceValue: 1000,
          desiredIssueDate: new Date(),
          serviceDescription: "Serviço de desenvolvimento",
          status: InvoiceStatus.PENDENTE_EMISSAO,
          createdAt: new Date(),
          updatedAt: new Date(),
          invoiceNumber: null,
          invoiceIssueDate: null
        },
        {
          id: "invoice-id-2",
          takerCnpj: "98765432000121",
          serviceCity: "Rio de Janeiro",
          serviceState: "RJ",
          serviceValue: 2000,
          desiredIssueDate: new Date(),
          serviceDescription: "Serviço de consultoria",
          status: InvoiceStatus.EMITIDA,
          createdAt: new Date(),
          updatedAt: new Date(),
          invoiceNumber: "NF-123",
          invoiceIssueDate: new Date()
        }
      ];

      mockPrismaInvoiceModel.findMany.mockResolvedValue(mockInvoices);

      // Act
      const result = await invoiceRepository.findAll();

      // Assert
      expect(mockPrismaInvoiceModel.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockInvoices);
    });
  });

  describe("findById", () => {
    it("deve encontrar uma solicitação de nota fiscal pelo ID", async () => {
      // Arrange
      const mockInvoice: IInvoiceOutput = {
        id: "invoice-id-1",
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: new Date(),
        serviceDescription: "Serviço de desenvolvimento",
        status: InvoiceStatus.PENDENTE_EMISSAO,
        createdAt: new Date(),
        updatedAt: new Date(),
        invoiceNumber: null,
        invoiceIssueDate: null
      };

      mockPrismaInvoiceModel.findUnique.mockResolvedValue(mockInvoice);

      // Act
      const result = await invoiceRepository.findById({ id: "invoice-id-1" });

      // Assert
      expect(mockPrismaInvoiceModel.findUnique).toHaveBeenCalledWith({
        where: { id: "invoice-id-1" }
      });
      expect(result).toEqual(mockInvoice);
    });

    it("deve retornar null quando não encontrar uma solicitação pelo ID", async () => {
      // Arrange
      mockPrismaInvoiceModel.findUnique.mockResolvedValue(null);

      // Act
      const result = await invoiceRepository.findById({ id: "invoice-id-inexistente" });

      // Assert
      expect(mockPrismaInvoiceModel.findUnique).toHaveBeenCalledWith({
        where: { id: "invoice-id-inexistente" }
      });
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("deve atualizar uma solicitação de nota fiscal com sucesso", async () => {
      // Arrange
      const mockUpdateData = {
        status: InvoiceStatus.EMITIDA,
        invoiceNumber: "NF-123",
        invoiceIssueDate: new Date()
      };

      const mockUpdatedInvoice: IInvoiceOutput = {
        id: "invoice-id-1",
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: new Date(),
        serviceDescription: "Serviço de desenvolvimento",
        status: InvoiceStatus.EMITIDA,
        createdAt: new Date(),
        updatedAt: new Date(),
        invoiceNumber: "NF-123",
        invoiceIssueDate: new Date()
      };

      mockPrismaInvoiceModel.update.mockResolvedValue(mockUpdatedInvoice);

      // Act
      const result = await invoiceRepository.update({
        id: "invoice-id-1",
        data: mockUpdateData
      });

      // Assert
      expect(mockPrismaInvoiceModel.update).toHaveBeenCalledWith({
        where: { id: "invoice-id-1" },
        data: mockUpdateData
      });
      expect(result).toEqual(mockUpdatedInvoice);
    });
  });
});
