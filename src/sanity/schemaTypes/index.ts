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

// ✅ Export schema types array (optional helper)
export const schemaTypes = [
  quotation,
  outwardChallan,
  inwardChallan,
  // gatepassChallan,
  attendance,
  workOrder,
  documents,
  paymentDetails,
  inventory,
  directorpassword,
  gmSalesPassword,
  salesManagerPassword,
  executionPassword,
  mechanicalPassword,
  storePassword,
  jobApplication,
  button,
  inquiryRegister,
];

// ✅ Export final schema object (used by Sanity)
export const schema: { types: SchemaTypeDefinition[] } = {
  types: schemaTypes,
};
