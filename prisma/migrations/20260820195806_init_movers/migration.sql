-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "passwordHash" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "userId" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "originAddress" TEXT NOT NULL,
    "originZip" TEXT,
    "destAddress" TEXT NOT NULL,
    "destZip" TEXT,
    "distanceMiles" REAL NOT NULL DEFAULT 0,
    "homeSize" TEXT NOT NULL,
    "originFloor" INTEGER NOT NULL DEFAULT 0,
    "destFloor" INTEGER NOT NULL DEFAULT 0,
    "originElevator" BOOLEAN NOT NULL DEFAULT false,
    "destElevator" BOOLEAN NOT NULL DEFAULT false,
    "preferredDate" DATETIME,
    "flexibleDates" BOOLEAN NOT NULL DEFAULT false,
    "itemsDescription" TEXT,
    "items" JSONB,
    "photos" JSONB,
    "estimatedVolumeCuFt" REAL NOT NULL DEFAULT 0,
    "estimatedWeightLbs" REAL NOT NULL DEFAULT 0,
    "laborHours" REAL NOT NULL DEFAULT 0,
    "crewSize" INTEGER NOT NULL DEFAULT 2,
    "addons" JSONB,
    "tiers" JSONB NOT NULL,
    "aiSummary" TEXT,
    "aiConfidence" TEXT NOT NULL DEFAULT 'estimate',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selectedTier" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "depositAmount" REAL NOT NULL,
    "balanceAmount" REAL NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "crewId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "trackingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "crewLat" REAL,
    "crewLng" REAL,
    "etaMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "method" TEXT NOT NULL DEFAULT 'card',
    "last4" TEXT,
    "reference" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrackingEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "lat" REAL,
    "lng" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrackingEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Crew" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "lead" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 3,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "baseFee" REAL NOT NULL DEFAULT 149,
    "ratePerHourPerMover" REAL NOT NULL DEFAULT 65,
    "ratePerMile" REAL NOT NULL DEFAULT 1.25,
    "freeMileRadius" REAL NOT NULL DEFAULT 25,
    "ratePerCuFt" REAL NOT NULL DEFAULT 0.55,
    "stairsFeePerFlight" REAL NOT NULL DEFAULT 45,
    "noElevatorSurcharge" REAL NOT NULL DEFAULT 35,
    "depositPercent" REAL NOT NULL DEFAULT 0.20,
    "packingService" REAL NOT NULL DEFAULT 0.40,
    "packingFlat" REAL NOT NULL DEFAULT 280,
    "storageMonthly" REAL NOT NULL DEFAULT 180,
    "specialtyItemFee" REAL NOT NULL DEFAULT 120,
    "insuranceFullValue" REAL NOT NULL DEFAULT 0.015,
    "tierBasicMult" REAL NOT NULL DEFAULT 1.0,
    "tierStandardMult" REAL NOT NULL DEFAULT 1.28,
    "tierPremiumMult" REAL NOT NULL DEFAULT 1.6,
    "notes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_reference_key" ON "Quote"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_quoteId_key" ON "Booking"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");
