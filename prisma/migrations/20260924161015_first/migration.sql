-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "crossPlatfrom" TEXT[],
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatfromIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "platfromAccountId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatfromIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerId" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platfromUserId" TEXT NOT NULL,
    "platfrom" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "publish" BOOLEAN,
    "scheduledAt" TIMESTAMP(3),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContainerId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "instagram" BOOLEAN,
    "facebook" BOOLEAN,
    "tiktok" BOOLEAN,
    "threads" BOOLEAN,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlatfromIntegration_userId_provider_key" ON "PlatfromIntegration"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "ContainerId_containerId_key" ON "ContainerId"("containerId");

-- AddForeignKey
ALTER TABLE "PlatfromIntegration" ADD CONSTRAINT "PlatfromIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerId" ADD CONSTRAINT "ContainerId_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
