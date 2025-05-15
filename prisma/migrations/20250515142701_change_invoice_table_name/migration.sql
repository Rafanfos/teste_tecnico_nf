/*
  Warnings:

  - You are about to drop the `solicitacoes_notas_fiscais` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "solicitacoes_notas_fiscais";

-- CreateTable
CREATE TABLE "invoices" (
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

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);
