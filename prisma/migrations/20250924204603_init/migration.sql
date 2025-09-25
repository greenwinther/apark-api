-- CreateTable
CREATE TABLE "public"."Park" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Park_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attraction" (
    "id" SERIAL NOT NULL,
    "parkId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "heightReqCm" INTEGER NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Visit" (
    "id" SERIAL NOT NULL,
    "parkId" INTEGER NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "visitors" INTEGER NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QueueSample" (
    "id" SERIAL NOT NULL,
    "attractionId" INTEGER NOT NULL,
    "sampledAt" TIMESTAMP(3) NOT NULL,
    "minutes" INTEGER NOT NULL,

    CONSTRAINT "QueueSample_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Attraction" ADD CONSTRAINT "Attraction_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "public"."Park"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "public"."Park"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QueueSample" ADD CONSTRAINT "QueueSample_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "public"."Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
