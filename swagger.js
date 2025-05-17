const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    version: "1.0.0",
    title: "API de Solicitações de Notas Fiscais",
    description: "API para gerenciamento de solicitações de notas fiscais.",
  },
  host: "localhost:3000",
  basePath: "/invoices",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "InvoiceRequests",
      description: "Operações relacionadas a solicitações de notas fiscais",
    },
  ],
  definitions: {
    InvoiceRequest: {
      id: "clxkz2acg000008l3g4z9h2j7",
      takerCnpj: "12345678000195",
      serviceCity: "São Paulo",
      serviceState: "SP",
      serviceValue: 1500.5,
      desiredIssueDate: "2024-12-31T00:00:00.000Z",
      serviceDescription: "Consultoria em desenvolvimento de software",
      status: "PENDENTE_EMISSAO",
      createdAt: "2024-05-15T10:00:00.000Z",
      updatedAt: "2024-05-15T10:00:00.000Z",
      invoiceNumber: "NF0012345",
      invoiceIssueDate: "2024-05-15T11:00:00.000Z",
    },
    IInvoiceRequestCreate: {
      takerCnpj: "12345678000195",
      serviceCity: "São Paulo",
      serviceState: "SP",
      serviceValue: 1500.5,
      desiredIssueDate: "2024-12-31T00:00:00.000Z",
      serviceDescription: "Consultoria em desenvolvimento de software",
    },
    ErrorResponse: {
      message: "Erro de validação",
      errors: [
        {
          path: "body.takerCnpj",
          message: "CNPJ deve conter apenas números",
        },
      ],
      details: "Informações adicionais do erro",
    },
  },
  components: {
    schemas: {
      InvoiceRequest: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "cuid",
            example: "clxkz2acg000008l3g4z9h2j7",
          },
          takerCnpj: {
            type: "string",
            example: "12345678000195",
          },
          serviceCity: {
            type: "string",
            example: "São Paulo",
          },
          serviceState: {
            type: "string",
            example: "SP",
          },
          serviceValue: {
            type: "number",
            format: "float",
            example: 1500.5,
          },
          desiredIssueDate: {
            type: "string",
            format: "date-time",
            example: "2024-12-31T00:00:00.000Z",
          },
          serviceDescription: {
            type: "string",
            example: "Consultoria em desenvolvimento de software",
          },
          status: {
            type: "string",
            enum: ["PENDENTE_EMISSAO", "EMITIDA", "CANCELADA"],
            example: "PENDENTE_EMISSAO",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2024-05-15T10:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2024-05-15T10:00:00.000Z",
          },
          invoiceNumber: {
            type: "string",
            nullable: true,
            example: "NF0012345",
          },
          invoiceIssueDate: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2024-05-15T11:00:00.000Z",
          },
        },
      },
      IInvoiceRequestCreate: {
        type: "object",
        required: [
          "takerCnpj",
          "serviceCity",
          "serviceState",
          "serviceValue",
          "desiredIssueDate",
          "serviceDescription",
        ],
        properties: {
          takerCnpj: {
            type: "string",
            example: "12345678000195",
            description: "CNPJ do tomador do serviço (14 dígitos)",
          },
          serviceCity: {
            type: "string",
            example: "São Paulo",
            description: "Cidade de prestação do serviço",
          },
          serviceState: {
            type: "string",
            example: "SP",
            description: "Estado de prestação do serviço (UF com 2 caracteres)",
          },
          serviceValue: {
            type: "number",
            format: "float",
            example: 1500.5,
            description: "Valor do serviço",
          },
          desiredIssueDate: {
            type: "string",
            format: "date-time",
            example: "2024-12-31T00:00:00.000Z",
            description: "Data desejada para emissão da NF (ISO 8601)",
          },
          serviceDescription: {
            type: "string",
            example: "Consultoria em desenvolvimento de software",
            description: "Descrição detalhada do serviço prestado",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Erro de validação",
          },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  example: "body.takerCnpj",
                },
                message: {
                  type: "string",
                  example: "CNPJ deve conter apenas números",
                },
              },
            },
          },
          details: {
            type: "string",
            example: "Informações adicionais do erro",
          },
        },
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/api/routes/invoice.routes.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log(
    `Documentação Swagger gerada em ${outputFile} a partir dos JSDocs em ${endpointsFiles.join(
      ", "
    )} e do swagger.js`
  );
});

