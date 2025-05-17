import { InvoiceService } from "../../../src/core/services/invoice.service";
import { InvoiceStatus } from "@prisma/client";

const mockInvoiceRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

const mockExternalInvoiceService = {
  emitInvoice: jest.fn(),
};

jest.mock("../../../src/core/repositories/invoice.repository", () => {
  return {
    InvoiceRepository: jest
      .fn()
      .mockImplementation(() => mockInvoiceRepository),
  };
});

jest.mock("../../../src/infra/http/drfinancas.client", () => {
  return {
    DrFinancasClient: jest
      .fn()
      .mockImplementation(() => mockExternalInvoiceService),
  };
});

describe("InvoiceService", () => {
  let invoiceService: InvoiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    invoiceService = new InvoiceService();
  });

  describe("createInvoiceService", () => {
    it("deve criar uma solicitação de nota fiscal com sucesso", async () => {
      // Arrange
      const mockData = {
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: new Date(),
        serviceDescription: "Serviço de desenvolvimento",
      };

      const mockCreatedInvoice = {
        id: "invoice-id-1",
        ...mockData,
        status: InvoiceStatus.PENDENTE_EMISSAO,
        createdAt: new Date(),
        updatedAt: new Date(),
        invoiceNumber: null,
        invoiceIssueDate: null,
      };

      mockInvoiceRepository.create.mockResolvedValue(mockCreatedInvoice);

      // Act
      const result = await invoiceService.createInvoiceService(mockData);

      // Assert
      expect(mockInvoiceRepository.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockCreatedInvoice);
    });
  });

  describe("listInvoicesService", () => {
    it("deve listar todas as solicitações de nota fiscal", async () => {
      // Arrange
      const mockInvoices = [
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
          invoiceIssueDate: null,
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
          invoiceIssueDate: new Date(),
        },
      ];

      mockInvoiceRepository.findAll.mockResolvedValue(mockInvoices);

      // Act
      const result = await invoiceService.listInvoicesService();

      // Assert
      expect(mockInvoiceRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockInvoices);
    });
  });

  describe("findInvoiceByIdService", () => {
    it("deve encontrar uma solicitação de nota fiscal pelo ID", async () => {
      // Arrange
      const mockInvoice = {
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
        invoiceIssueDate: null,
      };

      mockInvoiceRepository.findById.mockResolvedValue(mockInvoice);

      // Act
      const result = await invoiceService.findInvoiceByIdService(
        "invoice-id-1"
      );

      // Assert
      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith({
        id: "invoice-id-1",
      });
      expect(result).toEqual(mockInvoice);
    });

    it("deve retornar null quando não encontrar uma solicitação pelo ID", async () => {
      // Arrange
      mockInvoiceRepository.findById.mockResolvedValue(null);

      // Act
      const result = await invoiceService.findInvoiceByIdService(
        "invoice-id-inexistente"
      );

      // Assert
      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith({
        id: "invoice-id-inexistente",
      });
      expect(result).toBeNull();
    });
  });

  describe("emitInvoiceService", () => {
    it("deve emitir uma nota fiscal com sucesso", async () => {
      // Arrange
      const mockInvoiceRequest = {
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
        invoiceIssueDate: null,
      };

      const mockEmissionResponse = {
        numeroNF: "NF-123",
        dataEmissao: new Date().toISOString(),
      };

      const mockUpdatedInvoice = {
        ...mockInvoiceRequest,
        status: InvoiceStatus.EMITIDA,
        invoiceNumber: mockEmissionResponse.numeroNF,
        invoiceIssueDate: new Date(mockEmissionResponse.dataEmissao),
      };

      mockInvoiceRepository.findById.mockResolvedValue(mockInvoiceRequest);
      mockExternalInvoiceService.emitInvoice.mockResolvedValue(
        mockEmissionResponse
      );
      mockInvoiceRepository.update.mockResolvedValue(mockUpdatedInvoice);

      // Act
      const result = await invoiceService.emitInvoiceService("invoice-id-1");

      // Assert
      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith({
        id: "invoice-id-1",
      });
      expect(mockExternalInvoiceService.emitInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          takerCnpj: mockInvoiceRequest.takerCnpj,
          serviceCity: mockInvoiceRequest.serviceCity,
          serviceState: mockInvoiceRequest.serviceState,
          serviceValue: mockInvoiceRequest.serviceValue,
          desiredIssueDate: expect.any(String),
          serviceDescription: mockInvoiceRequest.serviceDescription,
        })
      );
      expect(mockInvoiceRepository.update).toHaveBeenCalledWith({
        id: "invoice-id-1",
        data: expect.objectContaining({
          status: InvoiceStatus.EMITIDA,
          invoiceNumber: "NF-123",
          invoiceIssueDate: expect.any(Date),
        }),
      });
      expect(result).toEqual(mockUpdatedInvoice);
    });

    it("deve lançar erro quando a solicitação não for encontrada", async () => {
      // Arrange
      mockInvoiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        invoiceService.emitInvoiceService("invoice-id-inexistente")
      ).rejects.toThrow("Solicitação não encontrada.");

      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith({
        id: "invoice-id-inexistente",
      });
      expect(mockExternalInvoiceService.emitInvoice).not.toHaveBeenCalled();
      expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando a nota fiscal já estiver emitida", async () => {
      // Arrange
      const mockInvoiceRequest = {
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
        invoiceIssueDate: new Date(),
      };

      mockInvoiceRepository.findById.mockResolvedValue(mockInvoiceRequest);

      // Act & Assert
      await expect(
        invoiceService.emitInvoiceService("invoice-id-1")
      ).rejects.toThrow("Nota Fiscal já emitida para esta solicitação.");

      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith({
        id: "invoice-id-1",
      });
      expect(mockExternalInvoiceService.emitInvoice).not.toHaveBeenCalled();
      expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando a solicitação estiver cancelada", async () => {
      // Arrange
      const mockInvoiceRequest = {
        id: "invoice-id-1",
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: new Date(),
        serviceDescription: "Serviço de desenvolvimento",
        status: InvoiceStatus.CANCELADA,
        createdAt: new Date(),
        updatedAt: new Date(),
        invoiceNumber: null,
        invoiceIssueDate: null,
      };

      mockInvoiceRepository.findById.mockResolvedValue(mockInvoiceRequest);

      // Act & Assert
      await expect(
        invoiceService.emitInvoiceService("invoice-id-1")
      ).rejects.toThrow(
        "Não é possível emitir Nota Fiscal para uma solicitação cancelada."
      );

      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith({
        id: "invoice-id-1",
      });
      expect(mockExternalInvoiceService.emitInvoice).not.toHaveBeenCalled();
      expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando o serviço externo falhar", async () => {
      // Arrange
      const mockInvoiceRequest = {
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
        invoiceIssueDate: null,
      };

      mockInvoiceRepository.findById.mockResolvedValue(mockInvoiceRequest);
      mockExternalInvoiceService.emitInvoice.mockRejectedValue(
        new Error("API Externa: 500 - Erro interno")
      );

      // Act & Assert
      await expect(
        invoiceService.emitInvoiceService("invoice-id-1")
      ).rejects.toThrow(
        "Falha ao emitir Nota Fiscal: API Externa: 500 - Erro interno"
      );

      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith({
        id: "invoice-id-1",
      });
      expect(mockExternalInvoiceService.emitInvoice).toHaveBeenCalled();
      expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando falhar ao atualizar a solicitação após emissão", async () => {
      // Arrange
      const mockInvoiceRequest = {
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
        invoiceIssueDate: null,
      };

      const mockEmissionResponse = {
        invoiceNumber: "NF-123",
        issueDate: new Date().toISOString(),
      };

      mockInvoiceRepository.findById.mockResolvedValue(mockInvoiceRequest);
      mockExternalInvoiceService.emitInvoice.mockResolvedValue(
        mockEmissionResponse
      );
      mockInvoiceRepository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(
        invoiceService.emitInvoiceService("invoice-id-1")
      ).rejects.toThrow("Falha ao atualizar solicitação após emissão.");

      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith({
        id: "invoice-id-1",
      });
      expect(mockExternalInvoiceService.emitInvoice).toHaveBeenCalled();
      expect(mockInvoiceRepository.update).toHaveBeenCalled();
    });
  });
});

