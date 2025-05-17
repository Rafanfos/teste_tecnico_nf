const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    version: "1.0.0",
    title: "Invoice Request API",
    description: "API for managing invoice requests.",
  },
  host: "localhost:3000",
  servers: [
    {
      url: "http://localhost:3000/api/invoices",
    },
  ],
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "InvoiceRequests",
      description: "Operations related to invoice requests",
    },
  ],

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
          takerCnpj: { type: "string", example: "12345678000195" },
          serviceCity: { type: "string", example: "São Paulo" },
          serviceState: { type: "string", example: "SP" },
          serviceValue: { type: "number", format: "float", example: 1500.5 },
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
            description: "CNPJ of the service taker (14 digits)",
          },
          serviceCity: {
            type: "string",
            example: "São Paulo",
            description: "City of service provision",
          },
          serviceState: {
            type: "string",
            example: "SP",
            description: "State of service provision (UF with 2 characters)",
          },
          serviceValue: {
            type: "number",
            format: "float",
            example: 1500.5,
            description: "Value of the service",
          },
          desiredIssueDate: {
            type: "string",
            format: "date-time",
            example: "2024-12-31T00:00:00.000Z",
            description: "Desired date for NF emission (ISO 8601)",
          },
          serviceDescription: {
            type: "string",
            example: "Software development consulting",
            description: "Detailed description of the service provided",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Validation Error" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string", example: "body.takerCnpj" },
                message: {
                  type: "string",
                  example: "CNPJ must contain only numbers",
                },
              },
            },
          },
          details: { type: "string", example: "Additional error information" },
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

