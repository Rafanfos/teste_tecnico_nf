import { z } from "zod";

export const createInvoiceRequestSchema = z.object({
  body: z.object({
    takerCnpj: z
      .string()
      .min(14)
      .max(14)
      .regex(/^\d+$/, "CNPJ must contain only numbers"),
    serviceCity: z.string().min(1, "City is required"),
    serviceState: z.string().length(2, "State must have 2 characters (UF)"),
    serviceValue: z.number().positive("Service value must be positive"),
    desiredIssueDate: z
      .string()
      .datetime({ message: "Desired issue date must be a valid ISO date" }),
    serviceDescription: z.string().min(1, "Service description is required"),
  }),
});

export const getInvoiceRequestSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid invoice request ID" }),
  }),
});

export const emitInvoiceSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid invoice request ID" }),
  }),
});
