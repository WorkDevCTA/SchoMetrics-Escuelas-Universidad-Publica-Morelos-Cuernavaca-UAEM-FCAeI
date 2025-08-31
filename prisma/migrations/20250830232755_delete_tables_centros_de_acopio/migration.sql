/*
  Warnings:

  - You are about to drop the `CenterMaterial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Material` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecyclingCenter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CenterMaterial" DROP CONSTRAINT "CenterMaterial_centerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CenterMaterial" DROP CONSTRAINT "CenterMaterial_materialId_fkey";

-- DropTable
DROP TABLE "public"."CenterMaterial";

-- DropTable
DROP TABLE "public"."Material";

-- DropTable
DROP TABLE "public"."RecyclingCenter";

-- DropEnum
DROP TYPE "public"."MaterialCategory";
