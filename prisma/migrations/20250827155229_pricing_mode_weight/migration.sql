-- CreateEnum
CREATE TYPE "PricingMode" AS ENUM ('UNIT', 'WEIGHT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "packageWeightKg" DOUBLE PRECISION DEFAULT 1,
ADD COLUMN     "pricingMode" "PricingMode" NOT NULL DEFAULT 'UNIT';
