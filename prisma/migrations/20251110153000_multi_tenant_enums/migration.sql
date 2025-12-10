-- Create new enum types
CREATE TYPE "ClientType" AS ENUM ('individual', 'company');
CREATE TYPE "SupplierStatus" AS ENUM ('active', 'inactive');
CREATE TYPE "PartnerStatus" AS ENUM ('active', 'inactive');
CREATE TYPE "InstallerType" AS ENUM ('individual', 'ip', 'company');
CREATE TYPE "InstallerAvailability" AS ENUM ('available', 'busy', 'vacation');
CREATE TYPE "InstallerStatus" AS ENUM ('active', 'inactive');
CREATE TYPE "OrderStatus" AS ENUM ('draft', 'sent', 'approved', 'in_production', 'completed');
CREATE TYPE "ProposalStatus" AS ENUM ('draft', 'sent', 'confirmed', 'expired');
CREATE TYPE "ProposalType" AS ENUM ('proposal', 'order');

-- Alter Client
ALTER TABLE "Client"
  ADD COLUMN "organizationId" TEXT,
  ALTER COLUMN "type" TYPE "ClientType" USING "type"::text::"ClientType";
CREATE INDEX "Client_organizationId_idx" ON "Client"("organizationId");
ALTER TABLE "Client"
  ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter Supplier
ALTER TABLE "Supplier"
  ADD COLUMN "organizationId" TEXT,
  ALTER COLUMN "status" TYPE "SupplierStatus" USING "status"::text::"SupplierStatus";
CREATE INDEX "Supplier_organizationId_idx" ON "Supplier"("organizationId");
ALTER TABLE "Supplier"
  ADD CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter Partner
ALTER TABLE "Partner"
  ADD COLUMN "organizationId" TEXT,
  ALTER COLUMN "status" TYPE "PartnerStatus" USING "status"::text::"PartnerStatus";
CREATE INDEX "Partner_organizationId_idx" ON "Partner"("organizationId");
ALTER TABLE "Partner"
  ADD CONSTRAINT "Partner_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter Installer
ALTER TABLE "Installer"
  ADD COLUMN "organizationId" TEXT,
  ALTER COLUMN "type" TYPE "InstallerType" USING "type"::text::"InstallerType",
  ALTER COLUMN "availability" TYPE "InstallerAvailability" USING "availability"::text::"InstallerAvailability",
  ALTER COLUMN "status" TYPE "InstallerStatus" USING "status"::text::"InstallerStatus";
CREATE INDEX "Installer_organizationId_idx" ON "Installer"("organizationId");
ALTER TABLE "Installer"
  ADD CONSTRAINT "Installer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter Dictionary
ALTER TABLE "Dictionary"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "Dictionary_organizationId_idx" ON "Dictionary"("organizationId");
ALTER TABLE "Dictionary"
  ADD CONSTRAINT "Dictionary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter Category
ALTER TABLE "Category"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "Category_organizationId_idx" ON "Category"("organizationId");
ALTER TABLE "Category"
  ADD CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter Product
ALTER TABLE "Product"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "Product_organizationId_idx" ON "Product"("organizationId");
ALTER TABLE "Product"
  ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter Order
ALTER TABLE "Order"
  ADD COLUMN "organizationId" TEXT,
  ALTER COLUMN "status" TYPE "OrderStatus" USING "status"::text::"OrderStatus";
CREATE INDEX "Order_organizationId_idx" ON "Order"("organizationId");
ALTER TABLE "Order"
  ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter ProductCategory
ALTER TABLE "ProductCategory"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "ProductCategory_organizationId_idx" ON "ProductCategory"("organizationId");
ALTER TABLE "ProductCategory"
  ADD CONSTRAINT "ProductCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter SupplierProductCategory
ALTER TABLE "SupplierProductCategory"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "SupplierProductCategory_organizationId_idx" ON "SupplierProductCategory"("organizationId");
ALTER TABLE "SupplierProductCategory"
  ADD CONSTRAINT "SupplierProductCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter ProposalDocument
ALTER TABLE "ProposalDocument"
  ADD COLUMN "organizationId" TEXT,
  ALTER COLUMN "status" TYPE "ProposalStatus" USING "status"::text::"ProposalStatus",
  ALTER COLUMN "type" TYPE "ProposalType" USING "type"::text::"ProposalType";
CREATE INDEX "ProposalDocument_organizationId_idx" ON "ProposalDocument"("organizationId");
ALTER TABLE "ProposalDocument"
  ADD CONSTRAINT "ProposalDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter ProposalGroup
ALTER TABLE "ProposalGroup"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "ProposalGroup_organizationId_idx" ON "ProposalGroup"("organizationId");
ALTER TABLE "ProposalGroup"
  ADD CONSTRAINT "ProposalGroup_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter ProposalPosition
ALTER TABLE "ProposalPosition"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "ProposalPosition_organizationId_idx" ON "ProposalPosition"("organizationId");
ALTER TABLE "ProposalPosition"
  ADD CONSTRAINT "ProposalPosition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter VATRate
ALTER TABLE "VATRate"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "VATRate_organizationId_idx" ON "VATRate"("organizationId");
ALTER TABLE "VATRate"
  ADD CONSTRAINT "VATRate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter DocumentTemplate
ALTER TABLE "DocumentTemplate"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "DocumentTemplate_organizationId_idx" ON "DocumentTemplate"("organizationId");
ALTER TABLE "DocumentTemplate"
  ADD CONSTRAINT "DocumentTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter ParameterTemplate
ALTER TABLE "ParameterTemplate"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "ParameterTemplate_organizationId_idx" ON "ParameterTemplate"("organizationId");
ALTER TABLE "ParameterTemplate"
  ADD CONSTRAINT "ParameterTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter ParameterValue
ALTER TABLE "ParameterValue"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "ParameterValue_organizationId_idx" ON "ParameterValue"("organizationId");
ALTER TABLE "ParameterValue"
  ADD CONSTRAINT "ParameterValue_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter CategoryParameter
ALTER TABLE "CategoryParameter"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "CategoryParameter_organizationId_idx" ON "CategoryParameter"("organizationId");
ALTER TABLE "CategoryParameter"
  ADD CONSTRAINT "CategoryParameter_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter SupplierParameterOverride
ALTER TABLE "SupplierParameterOverride"
  ADD COLUMN "organizationId" TEXT;
CREATE INDEX "SupplierParameterOverride_organizationId_idx" ON "SupplierParameterOverride"("organizationId");
ALTER TABLE "SupplierParameterOverride"
  ADD CONSTRAINT "SupplierParameterOverride_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update DocumentStatus default color
ALTER TABLE "DocumentStatus"
  ALTER COLUMN "color" SET DEFAULT '#9CA3AF';

-- DocumentStatus default color
ALTER TABLE "DocumentStatus"
  ALTER COLUMN "color" SET DEFAULT '#9CA3AF';
