-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('PENDING_REVIEW', 'REVIEWED');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('RECYCLING', 'TREE_PLANTING', 'WATER_SAVING', 'COMPOSTING', 'ENERGY_SAVING', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."RewardCategory" AS ENUM ('DISCOUNT', 'WORKSHOP', 'PRODUCT', 'RECOGNITION', 'EXPERIENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MaterialCategory" AS ENUM ('PLASTIC', 'PAPER', 'GLASS', 'METAL', 'ORGANIC', 'ELECTRONIC', 'HAZARDOUS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ArticleTopic" AS ENUM ('REDUCCION_RESIDUOS', 'AHORRO_RECURSOS', 'CONSUMO_RESPONSABLE', 'BIODIVERSIDAD', 'HUERTOS_URBANOS', 'MOVILIDAD_SOSTENIBLE', 'CAMBIO_CLIMATICO', 'OTRO');

-- CreateEnum
CREATE TYPE "public"."VisualMaterialTopic" AS ENUM ('INFOGRAFIA', 'VIDEO_TUTORIAL', 'PRESENTACION', 'GALERIA_IMAGENES', 'GUIA_VISUAL_RAPIDA', 'ECO_RETO_VISUAL', 'OTRO');

-- CreateEnum
CREATE TYPE "public"."VideoTopic" AS ENUM ('TUTORIAL_PRACTICO', 'CONSEJO_RAPIDO', 'DEMOSTRACION_PROYECTO', 'ENTREVISTA_EXPERTO', 'ANIMACION_EXPLICATIVA', 'ECO_NOTICIA_BREVE', 'OTRO');

-- CreateEnum
CREATE TYPE "public"."AnnouncementTopic" AS ENUM ('AVISO_SCHOMETRICS', 'AVISO_ESCOLAR', 'AVISO_AMBIENTAL', 'AVISO_GENERAL', 'AVISO_ACTUALIZACION');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "userType" "public"."UserType" NOT NULL DEFAULT 'STUDENT',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "city" TEXT,
    "state" TEXT,
    "avatarUrl" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Evidence" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."ActivityType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "public"."ActivityStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityReviewed" (
    "id" TEXT NOT NULL,
    "activityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "activityTitle" TEXT,
    "activityDesc" TEXT,
    "activityDate" TIMESTAMP(3),
    "activityPoints" INTEGER,
    "activityQuantity" DOUBLE PRECISION NOT NULL,
    "activityUnit" TEXT,
    "activityType" "public"."ActivityType",
    "activityStatus" "public"."ActivityStatus",

    CONSTRAINT "ActivityReviewed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reward" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "quantity" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "category" "public"."RewardCategory" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Redemption" (
    "id" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rewardLimitToUse" TIMESTAMP(3) NOT NULL,
    "rewardFolio" TEXT NOT NULL,
    "rewardId" TEXT,
    "userId" TEXT NOT NULL,
    "rewardTitle" TEXT,
    "rewardDesc" TEXT,
    "rewardPoints" INTEGER,
    "rewardQuantity" INTEGER,
    "rewardExpiresAt" TIMESTAMP(3),
    "rewardCategory" "public"."RewardCategory",
    "rewardCreatedAt" TIMESTAMP(3),

    CONSTRAINT "Redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecyclingCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "openingHours" TEXT,

    CONSTRAINT "RecyclingCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."MaterialCategory" NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CenterMaterial" (
    "id" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "CenterMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EducationalArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topic" "public"."ArticleTopic" NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorInstitution" TEXT NOT NULL DEFAULT 'Facultad de Contaduría, Administración e Informática - UAEM',
    "authorInfo" TEXT,
    "coverImageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationalArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArticleRating" (
    "id" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisualMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topic" "public"."VisualMaterialTopic" NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorInstitution" TEXT NOT NULL DEFAULT 'Facultad de Contaduría, Administración e Informática - UAEM',
    "authorInfo" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisualMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisualMaterialImage" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "visualMaterialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisualMaterialImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisualMaterialRating" (
    "id" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL,
    "visualMaterialId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisualMaterialRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShortVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoS3Key" TEXT,
    "externalVideoUrl" TEXT,
    "thumbnailS3Key" TEXT,
    "duration" INTEGER,
    "topic" "public"."VideoTopic" NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorInstitution" TEXT NOT NULL DEFAULT 'Facultad de Contaduría, Administración e Informática - UAEM',
    "authorInfo" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShortVideoRating" (
    "id" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL,
    "shortVideoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortVideoRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "topic" "public"."AnnouncementTopic" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."validation_tokens_user" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validation_tokens_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ProfileBadges" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfileBadges_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_matricula_key" ON "public"."User"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "public"."Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE INDEX "Evidence_activityId_idx" ON "public"."Evidence"("activityId");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "public"."Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_status_idx" ON "public"."Activity"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CenterMaterial_centerId_materialId_key" ON "public"."CenterMaterial"("centerId", "materialId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "EducationalArticle_userId_idx" ON "public"."EducationalArticle"("userId");

-- CreateIndex
CREATE INDEX "EducationalArticle_topic_idx" ON "public"."EducationalArticle"("topic");

-- CreateIndex
CREATE INDEX "ArticleRating_articleId_idx" ON "public"."ArticleRating"("articleId");

-- CreateIndex
CREATE INDEX "ArticleRating_userId_idx" ON "public"."ArticleRating"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleRating_userId_articleId_key" ON "public"."ArticleRating"("userId", "articleId");

-- CreateIndex
CREATE INDEX "VisualMaterial_userId_idx" ON "public"."VisualMaterial"("userId");

-- CreateIndex
CREATE INDEX "VisualMaterial_topic_idx" ON "public"."VisualMaterial"("topic");

-- CreateIndex
CREATE INDEX "VisualMaterialImage_visualMaterialId_idx" ON "public"."VisualMaterialImage"("visualMaterialId");

-- CreateIndex
CREATE INDEX "VisualMaterialRating_visualMaterialId_idx" ON "public"."VisualMaterialRating"("visualMaterialId");

-- CreateIndex
CREATE INDEX "VisualMaterialRating_userId_idx" ON "public"."VisualMaterialRating"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VisualMaterialRating_userId_visualMaterialId_key" ON "public"."VisualMaterialRating"("userId", "visualMaterialId");

-- CreateIndex
CREATE INDEX "ShortVideo_userId_idx" ON "public"."ShortVideo"("userId");

-- CreateIndex
CREATE INDEX "ShortVideo_topic_idx" ON "public"."ShortVideo"("topic");

-- CreateIndex
CREATE INDEX "ShortVideoRating_shortVideoId_idx" ON "public"."ShortVideoRating"("shortVideoId");

-- CreateIndex
CREATE INDEX "ShortVideoRating_userId_idx" ON "public"."ShortVideoRating"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShortVideoRating_userId_shortVideoId_key" ON "public"."ShortVideoRating"("userId", "shortVideoId");

-- CreateIndex
CREATE INDEX "Announcement_topic_idx" ON "public"."Announcement"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "validation_tokens_user_token_key" ON "public"."validation_tokens_user"("token");

-- CreateIndex
CREATE INDEX "_ProfileBadges_B_index" ON "public"."_ProfileBadges"("B");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityReviewed" ADD CONSTRAINT "ActivityReviewed_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Redemption" ADD CONSTRAINT "Redemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "public"."Reward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CenterMaterial" ADD CONSTRAINT "CenterMaterial_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "public"."RecyclingCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CenterMaterial" ADD CONSTRAINT "CenterMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EducationalArticle" ADD CONSTRAINT "EducationalArticle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticleRating" ADD CONSTRAINT "ArticleRating_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."EducationalArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticleRating" ADD CONSTRAINT "ArticleRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisualMaterial" ADD CONSTRAINT "VisualMaterial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisualMaterialImage" ADD CONSTRAINT "VisualMaterialImage_visualMaterialId_fkey" FOREIGN KEY ("visualMaterialId") REFERENCES "public"."VisualMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisualMaterialRating" ADD CONSTRAINT "VisualMaterialRating_visualMaterialId_fkey" FOREIGN KEY ("visualMaterialId") REFERENCES "public"."VisualMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisualMaterialRating" ADD CONSTRAINT "VisualMaterialRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShortVideo" ADD CONSTRAINT "ShortVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShortVideoRating" ADD CONSTRAINT "ShortVideoRating_shortVideoId_fkey" FOREIGN KEY ("shortVideoId") REFERENCES "public"."ShortVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShortVideoRating" ADD CONSTRAINT "ShortVideoRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProfileBadges" ADD CONSTRAINT "_ProfileBadges_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProfileBadges" ADD CONSTRAINT "_ProfileBadges_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
