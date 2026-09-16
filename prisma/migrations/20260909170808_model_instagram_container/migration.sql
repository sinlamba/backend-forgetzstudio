-- CreateTable
CREATE TABLE "InstagramContainer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instagramUserId" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "publish" BOOLEAN,
    "status" BOOLEAN,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramContainer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InstagramContainer" ADD CONSTRAINT "InstagramContainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
