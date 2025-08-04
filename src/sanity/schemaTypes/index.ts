import { type SchemaTypeDefinition } from 'sanity'
import quotation from './quotation'
import attendance from './sales-team-attendance'
import workOrder from './work-order'
import documents from './documents'
import paymentDetails from './payment-details'
// import workOrderStatus from './work-order-status'
import inventory from './inventory'
import directorpassword from './directorpassword'
import gmSalesPassword from './gm-sales-password'
import salesManagerPassword from './sales-manager-password'
import executionPassword from './execution-password'
import mechanicalPassword from './mechanical-password'
import storePassword from './store-password'






export const schemaTypes = [quotation]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    quotation,
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


  ],
}
