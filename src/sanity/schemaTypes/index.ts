import { type SchemaTypeDefinition } from 'sanity'
import quotation from './quotation'
import attendance from './sales-team-attendance'
import workOrder from './work-order'
import documents from './documents'
import paymentDetails from './payment-details'
import workOrderStatus from './work-order-status'
import inventory from './inventory'



export const schemaTypes = [quotation]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    quotation,
  attendance,
  workOrder,
  documents,
  paymentDetails,
  workOrderStatus,
  inventory,
  
  ],
}
