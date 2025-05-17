import request from "supertest";
import app from "../../../src/app";
import { InvoiceStatus } from "@prisma/client";

jest.mock("../../../src/core/services/invoice.service", () => {
  const mockInvoiceService = {
    createInvoiceService: jest.fn(),
    listInvoicesService: jest.fn(),
    findInvoiceByIdService: jest.fn(),
    emitInvoiceService: jest.fn(),
  };

  return {
    InvoiceService: jest.fn().mockImplementation(() => mockInvoiceService),
  };
});

// Mock do middleware de validação para evitar bloqueios nos testes
jest.mock("../../../src/api/middlewares/invoice.middleware", () => ({
  validateRequest: () => (req: any, res: any, next: any) => next(),
}));

// Exportando o mock para uso nos testes
const mockInvoiceService = jest
  .requireMock("../../../src/core/services/invoice.service")
  .InvoiceService();

describe("Invoice Routes Integration Tests", () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe("POST /invoices", () => {
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

      mockInvoiceService.createInvoiceService.mockResolvedValue(
        mockCreatedInvoice
      );

      // Act
      const response = await request(app)
        .post("/invoices")
        .send(mockRequestData)
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: "invoice-id-1",
          takerCnpj: "12345678000190",
          serviceCity: "São Paulo",
          serviceState: "SP",
          serviceValue: 1000,
          serviceDescription: "Serviço de desenvolvimento",
          status: InvoiceStatus.PENDENTE_EMISSAO,
        })
      );
      expect(mockInvoiceService.createInvoiceService).toHaveBeenCalledWith(
        expect.objectContaining({
          takerCnpj: "12345678000190",
          serviceCity: "São Paulo",
          serviceState: "SP",
          serviceValue: 1000,
          desiredIssueDate: expect.any(Date),
          serviceDescription: "Serviço de desenvolvimento",
        })
      );
    });

    it("deve retornar erro 400 quando os dados da solicitação forem inválidos", async () => {
      // Arrange
      const invalidRequestData = {
        // Faltando campos obrigatórios
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        // Faltando serviceState, serviceValue, desiredIssueDate, serviceDescription
      };

      const validationError = new Error("Dados inválidos");
      // @ts-ignore - Adicionando propriedade statusCode ao objeto Error
      validationError.statusCode = 400;
      mockInvoiceService.createInvoiceService.mockRejectedValue(
        validationError
      );

      // Act
      const response = await request(app)
        .post("/invoices")
        .send(invalidRequestData)
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("GET /invoices", () => {
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

      mockInvoiceService.listInvoicesService.mockResolvedValue(mockInvoices);

      // Act
      const response = await request(app)
        .get("/invoices")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          id: "invoice-id-1",
          takerCnpj: "12345678000190",
        })
      );
      expect(response.body[1]).toEqual(
        expect.objectContaining({
          id: "invoice-id-2",
          takerCnpj: "98765432000121",
        })
      );
      expect(mockInvoiceService.listInvoicesService).toHaveBeenCalled();
    });

    it("deve retornar uma lista vazia quando não houver solicitações", async () => {
      // Arrange
      mockInvoiceService.listInvoicesService.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get("/invoices")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(mockInvoiceService.listInvoicesService).toHaveBeenCalled();
    });
  });

  describe("GET /invoices/:id", () => {
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

      mockInvoiceService.findInvoiceByIdService.mockResolvedValue(mockInvoice);

      // Act
      const response = await request(app)
        .get("/invoices/invoice-id-1")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: "invoice-id-1",
          takerCnpj: "12345678000190",
          serviceCity: "São Paulo",
          serviceState: "SP",
          serviceValue: 1000,
          serviceDescription: "Serviço de desenvolvimento",
          status: InvoiceStatus.PENDENTE_EMISSAO,
        })
      );
      expect(mockInvoiceService.findInvoiceByIdService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
    });

    it("deve retornar status 404 quando não encontrar uma solicitação pelo ID", async () => {
      // Arrange
      mockInvoiceService.findInvoiceByIdService.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .get("/invoices/invoice-id-inexistente")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Solicitação não encontrada." });
      expect(mockInvoiceService.findInvoiceByIdService).toHaveBeenCalledWith(
        "invoice-id-inexistente"
      );
    });
  });

  describe("POST /invoices/:id/emit", () => {
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

      mockInvoiceService.emitInvoiceService.mockResolvedValue(
        mockEmittedInvoice
      );

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-1/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: "invoice-id-1",
          status: InvoiceStatus.EMITIDA,
          invoiceNumber: "NF-123",
        })
      );
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
    });

    it("deve retornar status 404 quando a solicitação não for encontrada", async () => {
      // Arrange
      const notFoundError = new Error("Solicitação não encontrada");
      // @ts-ignore - Adicionando propriedade statusCode ao objeto Error
      notFoundError.statusCode = 404;
      mockInvoiceService.emitInvoiceService.mockRejectedValue(notFoundError);

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-inexistente/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Solicitação não encontrada" });
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-inexistente"
      );
    });

    it("deve retornar status 400 quando a nota fiscal já estiver emitida", async () => {
      // Arrange
      const alreadyEmittedError = new Error(
        "Nota Fiscal já emitida para esta solicitação"
      );
      // @ts-ignore - Adicionando propriedade statusCode ao objeto Error
      alreadyEmittedError.statusCode = 400;
      mockInvoiceService.emitInvoiceService.mockRejectedValue(
        alreadyEmittedError
      );

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-1/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Nota Fiscal já emitida para esta solicitação",
      });
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
    });

    it("deve retornar status 400 quando a solicitação estiver cancelada", async () => {
      // Arrange
      const canceledError = new Error(
        "Não é possível emitir Nota Fiscal para uma solicitação cancelada"
      );
      // @ts-ignore - Adicionando propriedade statusCode ao objeto Error
      canceledError.statusCode = 400;
      mockInvoiceService.emitInvoiceService.mockRejectedValue(canceledError);

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-1/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message:
          "Não é possível emitir Nota Fiscal para uma solicitação cancelada",
      });
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
    });

    it("deve retornar status 400 quando houver erro na API externa", async () => {
      // Arrange
      const apiError = new Error("API Externa: 400 - Dados inválidos");
      // @ts-ignore - Adicionando propriedade statusCode ao objeto Error
      apiError.statusCode = 400;
      mockInvoiceService.emitInvoiceService.mockRejectedValue(apiError);

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-1/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Erro na solicitação à API externa (400).",
        details: "API Externa: 400 - Dados inválidos",
      });
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith(
        "invoice-id-1"
      );
    });
  });
});

