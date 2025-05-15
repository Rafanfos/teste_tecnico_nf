-- CreateEnum
CREATE TYPE "StatusNotaFiscal" AS ENUM ('PENDENTE_EMISSAO', 'EMITIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "solicitacoes_notas_fiscais" (
    "id" TEXT NOT NULL,
    "takerCnpj" TEXT NOT NULL,
    "serviceCity" TEXT NOT NULL,
    "serviceState" TEXT NOT NULL,
    "serviceValue" DOUBLE PRECISION NOT NULL,
    "desiredIssueDate" TIMESTAMP(3) NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "status" "StatusNotaFiscal" NOT NULL DEFAULT 'PENDENTE_EMISSAO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invoiceNumber" TEXT,
    "invoiceIssueDate" TIMESTAMP(3),

    CONSTRAINT "solicitacoes_notas_fiscais_pkey" PRIMARY KEY ("id")
);
