-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierProductCategory" (
    "id" TEXT NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalDocument" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "type" TEXT NOT NULL DEFAULT 'proposal',
    "signedAt" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 22.00,
    "vatAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" INTEGER,

    CONSTRAINT "ProposalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalGroup" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalPosition" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "supplierCategoryId" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "discount" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VATRate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VATRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductCategory_name_idx" ON "ProductCategory"("name");

-- CreateIndex
CREATE INDEX "ProductCategory_isActive_idx" ON "ProductCategory"("isActive");

-- CreateIndex
CREATE INDEX "SupplierProductCategory_supplierId_idx" ON "SupplierProductCategory"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierProductCategory_categoryId_idx" ON "SupplierProductCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProductCategory_supplierId_categoryId_key" ON "SupplierProductCategory"("supplierId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalDocument_number_key" ON "ProposalDocument"("number");

-- CreateIndex
CREATE INDEX "ProposalDocument_clientId_idx" ON "ProposalDocument"("clientId");

-- CreateIndex
CREATE INDEX "ProposalDocument_status_idx" ON "ProposalDocument"("status");

-- CreateIndex
CREATE INDEX "ProposalDocument_type_idx" ON "ProposalDocument"("type");

-- CreateIndex
CREATE INDEX "ProposalDocument_number_idx" ON "ProposalDocument"("number");

-- CreateIndex
CREATE INDEX "ProposalGroup_proposalId_idx" ON "ProposalGroup"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalGroup_sortOrder_idx" ON "ProposalGroup"("sortOrder");

-- CreateIndex
CREATE INDEX "ProposalPosition_groupId_idx" ON "ProposalPosition"("groupId");

-- CreateIndex
CREATE INDEX "ProposalPosition_categoryId_idx" ON "ProposalPosition"("categoryId");

-- CreateIndex
CREATE INDEX "ProposalPosition_sortOrder_idx" ON "ProposalPosition"("sortOrder");

-- CreateIndex
CREATE INDEX "VATRate_percentage_idx" ON "VATRate"("percentage");

-- CreateIndex
CREATE INDEX "VATRate_isDefault_idx" ON "VATRate"("isDefault");

-- CreateIndex
CREATE INDEX "VATRate_isActive_idx" ON "VATRate"("isActive");

-- AddForeignKey
ALTER TABLE "SupplierProductCategory" ADD CONSTRAINT "SupplierProductCategory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProductCategory" ADD CONSTRAINT "SupplierProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalDocument" ADD CONSTRAINT "ProposalDocument_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalGroup" ADD CONSTRAINT "ProposalGroup_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProposalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalPosition" ADD CONSTRAINT "ProposalPosition_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProposalGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalPosition" ADD CONSTRAINT "ProposalPosition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalPosition" ADD CONSTRAINT "ProposalPosition_supplierCategoryId_fkey" FOREIGN KEY ("supplierCategoryId") REFERENCES "SupplierProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
