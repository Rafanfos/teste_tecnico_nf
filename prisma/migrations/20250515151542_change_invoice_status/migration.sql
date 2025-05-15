/*
  Warnings:

  - The `status` column on the `invoices` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDENTE_EMISSAO', 'EMITIDA', 'CANCELADA');

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDENTE_EMISSAO';

-- DropEnum
DROP TYPE "StatusNotaFiscal";
