import request from "supertest";
import { app } from "../../../src/app";
import { InvoiceService } from "../../../src/core/services/invoice.service";
import { InvoiceStatus } from "@prisma/client";

// Mock do serviço
jest.mock("../../../src/core/services/invoice.service");

describe("Invoice Routes Integration Tests", () => {
  let mockInvoiceService: any;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configura o mock do serviço
    mockInvoiceService = new InvoiceService();
    
    // Substitui o construtor do InvoiceService para retornar nosso mock
    (InvoiceService as jest.MockedClass<typeof InvoiceService>).mockImplementation(() => mockInvoiceService);
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
        serviceDescription: "Serviço de desenvolvimento"
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
        invoiceIssueDate: null
      };

      mockInvoiceService.createInvoiceService = jest.fn().mockResolvedValue(mockCreatedInvoice);

      // Act
      const response = await request(app)
        .post("/invoices")
        .send(mockRequestData)
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({
        id: "invoice-id-1",
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        serviceDescription: "Serviço de desenvolvimento",
        status: InvoiceStatus.PENDENTE_EMISSAO
      }));
      expect(mockInvoiceService.createInvoiceService).toHaveBeenCalledWith(expect.objectContaining({
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        desiredIssueDate: expect.any(Date),
        serviceDescription: "Serviço de desenvolvimento"
      }));
    });

    it("deve retornar erro 400 quando os dados da solicitação forem inválidos", async () => {
      // Arrange
      const invalidRequestData = {
        // Faltando campos obrigatórios
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo"
        // Faltando serviceState, serviceValue, desiredIssueDate, serviceDescription
      };

      // Act
      const response = await request(app)
        .post("/invoices")
        .send(invalidRequestData)
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(mockInvoiceService.createInvoiceService).not.toHaveBeenCalled();
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

      mockInvoiceService.listInvoicesService = jest.fn().mockResolvedValue(mockInvoices);

      // Act
      const response = await request(app)
        .get("/invoices")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual(expect.objectContaining({
        id: "invoice-id-1",
        takerCnpj: "12345678000190"
      }));
      expect(response.body[1]).toEqual(expect.objectContaining({
        id: "invoice-id-2",
        takerCnpj: "98765432000121"
      }));
      expect(mockInvoiceService.listInvoicesService).toHaveBeenCalled();
    });

    it("deve retornar uma lista vazia quando não houver solicitações", async () => {
      // Arrange
      mockInvoiceService.listInvoicesService = jest.fn().mockResolvedValue([]);

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
        invoiceIssueDate: null
      };

      mockInvoiceService.findInvoiceByIdService = jest.fn().mockResolvedValue(mockInvoice);

      // Act
      const response = await request(app)
        .get("/invoices/invoice-id-1")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: "invoice-id-1",
        takerCnpj: "12345678000190",
        serviceCity: "São Paulo",
        serviceState: "SP",
        serviceValue: 1000,
        serviceDescription: "Serviço de desenvolvimento",
        status: InvoiceStatus.PENDENTE_EMISSAO
      }));
      expect(mockInvoiceService.findInvoiceByIdService).toHaveBeenCalledWith("invoice-id-1");
    });

    it("deve retornar status 404 quando não encontrar uma solicitação pelo ID", async () => {
      // Arrange
      mockInvoiceService.findInvoiceByIdService = jest.fn().mockResolvedValue(null);

      // Act
      const response = await request(app)
        .get("/invoices/invoice-id-inexistente")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Solicitação não encontrada." });
      expect(mockInvoiceService.findInvoiceByIdService).toHaveBeenCalledWith("invoice-id-inexistente");
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
        invoiceIssueDate: new Date()
      };

      mockInvoiceService.emitInvoiceService = jest.fn().mockResolvedValue(mockEmittedInvoice);

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-1/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: "invoice-id-1",
        status: InvoiceStatus.EMITIDA,
        invoiceNumber: "NF-123"
      }));
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith("invoice-id-1");
    });

    it("deve retornar status 404 quando a solicitação não for encontrada", async () => {
      // Arrange
      mockInvoiceService.emitInvoiceService = jest.fn().mockRejectedValue(new Error("Solicitação não encontrada"));

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-inexistente/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Solicitação não encontrada" });
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith("invoice-id-inexistente");
    });

    it("deve retornar status 400 quando a nota fiscal já estiver emitida", async () => {
      // Arrange
      mockInvoiceService.emitInvoiceService = jest.fn().mockRejectedValue(new Error("Nota Fiscal já emitida para esta solicitação"));

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-1/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Nota Fiscal já emitida para esta solicitação" });
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith("invoice-id-1");
    });

    it("deve retornar status 400 quando a solicitação estiver cancelada", async () => {
      // Arrange
      mockInvoiceService.emitInvoiceService = jest.fn().mockRejectedValue(
        new Error("Não é possível emitir Nota Fiscal para uma solicitação cancelada")
      );

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-1/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ 
        message: "Não é possível emitir Nota Fiscal para uma solicitação cancelada" 
      });
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith("invoice-id-1");
    });

    it("deve retornar status 400 quando houver erro na API externa", async () => {
      // Arrange
      mockInvoiceService.emitInvoiceService = jest.fn().mockRejectedValue(
        new Error("API Externa: 400 - Dados inválidos")
      );

      // Act
      const response = await request(app)
        .post("/invoices/invoice-id-1/emit")
        .set("Accept", "application/json");

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ 
        message: "Erro na solicitação à API externa (400).",
        details: "API Externa: 400 - Dados inválidos"
      });
      expect(mockInvoiceService.emitInvoiceService).toHaveBeenCalledWith("invoice-id-1");
    });
  });
});
