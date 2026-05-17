// schemaTypes/index.ts

import { type SchemaTypeDefinition } from "sanity";

// 🔹 Core Schemas
import quotation from "./quotation";
import attendance from "./sales-team-attendance";
import workOrder from "./work-order";
import documents from "./documents";
import paymentDetails from "./payment-details";
import inventory from "./inventory";
import directorpassword from "./directorpassword";
import gmSalesPassword from "./gm-sales-password";
import salesManagerPassword from "./sales-manager-password";
import executionPassword from "./execution-password";
import mechanicalPassword from "./mechanical-password";
import storePassword from "./store-password";
import jobApplication from "./jobsapplication";
import button from "./button";
import inquiryRegister from "./ir";

// 🔹 Gatepass Schemas
import { inwardChallan } from "./inward";
import { outwardChallan } from "./outward";
import { cost } from "./todaycosts";
import { mechanicalop } from "./wo";
import { paintoutop } from "./paint-out";
import { paintinop } from "./paint-in";
import { assembly } from "./assembly";
import { sr } from "./sr";
import { storeReturn } from "./storereturn";
import { storeSchema } from "./store";
// import { returnStockSchema } from "./returnstock";

// ✅ Export schema types array
export const schemaTypes: SchemaTypeDefinition[] = [
  quotation,
  outwardChallan,
  inwardChallan,
  attendance,
  workOrder,
  storeReturn,
  assembly,
  paintoutop,
  paintinop,
  mechanicalop,
  documents,
  storeSchema,
  paymentDetails,
  sr,
  inventory,
  directorpassword,
  gmSalesPassword,
  salesManagerPassword,
  cost,
  executionPassword,
  mechanicalPassword,
  storePassword,
  jobApplication,
  button,
  inquiryRegister,
  // returnStockSchema,
];

// ✅ Export final schema object
export const schema = {
  types: schemaTypes,
};