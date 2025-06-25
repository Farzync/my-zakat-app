-- CreateEnum
CREATE TYPE "ZakatType" AS ENUM ('FITRAH', 'MAL', 'INFAK', 'OTHER');

-- CreateEnum
CREATE TYPE "OnBehalfOfType" AS ENUM ('SELF', 'FAMILY', 'BADAL', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "zakatType" "ZakatType" NOT NULL,
    "notes" TEXT,
    "donorSignature" TEXT,
    "recipientSignature" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnBehalfOf" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "type" "OnBehalfOfType" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "OnBehalfOf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnBehalfOf" ADD CONSTRAINT "OnBehalfOf_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
