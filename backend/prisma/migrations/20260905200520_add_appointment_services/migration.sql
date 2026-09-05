-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "service" DROP NOT NULL;
