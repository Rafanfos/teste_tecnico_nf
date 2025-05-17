import { Request, Response, NextFunction } from "express";
import { InvoiceController } from "../../../src/api/controllers/invoice.controller";
import { InvoiceService } from "../../../src/core/services/invoice.service";
import { InvoiceStatus } from "@prisma/client";

jest.mock("../../../src/core/services/invoice.service");

describe("InvoiceController", () => {
  let invoiceController: InvoiceController;
  let mockInvoiceService: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockInvoiceService = new InvoiceService();
    mockRequest = {
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    (
      InvoiceService as jest.MockedClass<typeof InvoiceService>
    ).mockImplementation(() => mockInvoiceService);

    invoiceController = new InvoiceController();
  });

  describe("createInvoiceController", () => {
    it("deve criar uma solicitação de nota fiscal com sucesso", async () => {
      // Arrange
      const mockRequestData = {
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: "2025-05-20T00:00:00.000Z",
        serviceDescription: "Serviço de desenvolvimento",
      };

      const mockCreatedInvoice = {
        id: "invoice-id-1",
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: new Date("2025-05-20T00:00:00.000Z"),
        serviceDescription: "Serviço de desenvolvimento",
        status: InvoiceStatus.PENDENTE_EMISSAO,
        createdAt: new Date(),
        updatedAt: new Date(),
        invoiceNumber: null,
        invoiceIssueDate: null,
      };

      mockRequest.body = mockRequestData;
      mockInvoiceService.createInvoiceService = jest
        .fn()
        .mockResolvedValue(mockCreatedInvoice);

      // Act
      await invoiceController.createInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.createInvoiceService).toHaveBeenCalledWith({
        ...mockRequestData,
        desiredIssueDate: new Date(mockRequestData.desiredIssueDate),
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedInvoice);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve chamar next com erro quando o serviço falhar", async () => {
      // Arrange
      const mockError = new Error("Erro ao criar solicitação");
      mockRequest.body = {
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: "2025-05-20T00:00:00.000Z",
        serviceDescription: "Serviço de desenvolvimento",
      };
      mockInvoiceService.createInvoiceService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.createInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.createInvoiceService).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe("listInvoiceController", () => {
    it("deve listar todas as solicitações de nota fiscal com sucesso", async () => {
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

      mockInvoiceService.listInvoicesService = jest
        .fn()
        .mockResolvedValue(mockInvoices);

      // Act
      await invoiceController.listInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.listInvoicesService).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockInvoices);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve chamar next com erro quando o serviço falhar", async () => {
      // Arrange
      const mockError = new Error("Erro ao listar solicitações");
      mockInvoiceService.listInvoicesService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.listInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.listInvoicesService).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe("findInvoiceByIdController", () => {
    it("deve encontrar uma solicitação de nota fiscal pelo ID com sucesso", async () => {
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

      mockRequest.params = { id: "invoice-id-1" };
      mockInvoiceService.findInvoiceByIdService = jest
        .fn()
        .mockResolvedValue(mockInvoice);

      // Act
      await invoiceController.findInvoiceByIdController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.findInvoiceByIdService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockInvoice);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar status 404 quando não encontrar uma solicitação pelo ID", async () => {
      // Arrange
      mockRequest.params = { id: "invoice-id-inexistente" };
      mockInvoiceService.findInvoiceByIdService = jest
        .fn()
        .mockResolvedValue(null);

      // Act
      await invoiceController.findInvoiceByIdController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.findInvoiceByIdService).toHaveBeenCalledWith(
        "invoice-id-inexistente"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Solicitação não encontrada.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve chamar next com erro quando o serviço falhar", async () => {
      // Arrange
      const mockError = new Error("Erro ao buscar solicitação");
      mockRequest.params = { id: "invoice-id-1" };
      mockInvoiceService.findInvoiceByIdService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.findInvoiceByIdController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.findInvoiceByIdService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe("emitInvoiceController", () => {
    it("deve emitir uma nota fiscal com sucesso", async () => {
      // Arrange
      const mockEmittedInvoice = {
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

      mockRequest.params = { id: "invoice-id-1" };
      mockInvoiceService.emitInvoiceService = jest
        .fn()
        .mockResolvedValue(mockEmittedInvoice);

      // Act
      await invoiceController.emitInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEmittedInvoice);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar status 404 quando a solicitação não for encontrada", async () => {
      // Arrange
      const mockError = new Error("Solicitação não encontrada");
      mockRequest.params = { id: "invoice-id-inexistente" };
      mockInvoiceService.emitInvoiceService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.emitInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-inexistente"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: mockError.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar status 400 quando a nota fiscal já estiver emitida", async () => {
      // Arrange
      const mockError = new Error(
        "Nota Fiscal já emitida para esta solicitação"
      );
      mockRequest.params = { id: "invoice-id-1" };
      mockInvoiceService.emitInvoiceService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.emitInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: mockError.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar status 400 quando a solicitação estiver cancelada", async () => {
      // Arrange
      const mockError = new Error(
        "Não é possível emitir Nota Fiscal para uma solicitação cancelada"
      );
      mockRequest.params = { id: "invoice-id-1" };
      mockInvoiceService.emitInvoiceService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.emitInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: mockError.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar status 400 quando houver erro na API externa (400)", async () => {
      // Arrange
      const mockError = new Error("API Externa: 400 - Dados inválidos");
      mockRequest.params = { id: "invoice-id-1" };
      mockInvoiceService.emitInvoiceService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.emitInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Erro na solicitação à API externa (400).",
        details: mockError.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar status 401 quando houver erro de autenticação na API externa (401)", async () => {
      // Arrange
      const mockError = new Error("API Externa: 401 - Não autorizado");
      mockRequest.params = { id: "invoice-id-1" };
      mockInvoiceService.emitInvoiceService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.emitInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Erro de autenticação com a API externa (401).",
        details: mockError.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar status 500 quando houver erro interno na API externa (500)", async () => {
      // Arrange
      const mockError = new Error("API Externa: 500 - Erro interno");
      mockRequest.params = { id: "invoice-id-1" };
      mockInvoiceService.emitInvoiceService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.emitInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Erro interno na API externa (500).",
        details: mockError.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve chamar next com erro quando ocorrer um erro não mapeado", async () => {
      // Arrange
      const mockError = new Error("Erro desconhecido");
      mockRequest.params = { id: "invoice-id-1" };
      mockInvoiceService.emitInvoiceService = jest
        .fn()
        .mockRejectedValue(mockError);

      // Act
      await invoiceController.emitInvoiceController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});

