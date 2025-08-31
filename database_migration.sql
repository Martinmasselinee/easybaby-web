-- Manual Database Migration for Basket System
-- Run this directly in your PostgreSQL database

-- Create BasketStatus enum
CREATE TYPE "BasketStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'EXPIRED', 'ABANDONED');

-- Create ShoppingBasket table
CREATE TABLE "ShoppingBasket" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "sessionId" TEXT,
    "status" "BasketStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingBasket_pkey" PRIMARY KEY ("id")
);

-- Create BasketItem table
CREATE TABLE "BasketItem" (
    "id" TEXT NOT NULL,
    "basketId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "pickupHotelId" TEXT NOT NULL,
    "dropHotelId" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "dropDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceCents" INTEGER NOT NULL,
    "depositCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BasketItem_pkey" PRIMARY KEY ("id")
);

-- Create BasketReservation table
CREATE TABLE "BasketReservation" (
    "id" TEXT NOT NULL,
    "basketId" TEXT NOT NULL,
    "reservationCode" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userPhone" TEXT,
    "cityId" TEXT NOT NULL,
    "totalPriceCents" INTEGER NOT NULL,
    "totalDepositCents" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "stripeSetupIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BasketReservation_pkey" PRIMARY KEY ("id")
);

-- Add unique constraints
ALTER TABLE "BasketReservation" ADD CONSTRAINT "BasketReservation_reservationCode_key" UNIQUE ("reservationCode");

-- Add foreign key constraints
ALTER TABLE "BasketItem" ADD CONSTRAINT "BasketItem_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "ShoppingBasket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BasketItem" ADD CONSTRAINT "BasketItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BasketItem" ADD CONSTRAINT "BasketItem_pickupHotelId_fkey" FOREIGN KEY ("pickupHotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BasketItem" ADD CONSTRAINT "BasketItem_dropHotelId_fkey" FOREIGN KEY ("dropHotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BasketReservation" ADD CONSTRAINT "BasketReservation_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "ShoppingBasket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BasketReservation" ADD CONSTRAINT "BasketReservation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add basketReservationId to Reservation table
ALTER TABLE "Reservation" ADD COLUMN "basketReservationId" TEXT;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_basketReservationId_fkey" FOREIGN KEY ("basketReservationId") REFERENCES "BasketReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes for performance
CREATE INDEX "BasketItem_basketId_idx" ON "BasketItem"("basketId");
CREATE INDEX "BasketItem_productId_idx" ON "BasketItem"("productId");
CREATE INDEX "BasketReservation_basketId_idx" ON "BasketReservation"("basketId");
CREATE INDEX "BasketReservation_reservationCode_idx" ON "BasketReservation"("reservationCode");
