// src/app/work-order/edit/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Sidebar from "@/app/Components/sidebar"
import { DM_Sans } from "next/font/google"
import toast, { Toaster } from "react-hot-toast"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

interface ProductItem {
  serialNumber?: string
  itemDescription: string
  quantity: number
  remarks?: string
}

interface POItem {
  description: string
  unit: string
  quantity: number
  unitRatePKR: number
  totalAmountPKR: number
}

interface CustomerInfo {
  customerName: string
  salesPerson?: string
  contactPerson?: string
  mobileNo?: string
  phoneNo?: string
  email?: string
}

interface OrderDetails {
  productType?: string
  poNumber?: string
  poDate?: string
  poValue?: string
  deliveryDate?: string
  shopDrawingApproval: boolean
  shopDrawingApprovalDate?: string
  expectedCompletionDate?: string
  specialInstructions?: string
}

interface TermsAndConditions {
  paymentType?: string
  pricesIncludeGST: boolean
  deliveryMethod?: string
  warrantyPeriod?: string
}

interface RequiredDocuments {
  quotationWithFinalPrice?: File | null
  approvedShopDrawing?: File | null
  componentList?: File | null
  customerPOCopy?: File | null
  technicalSpecifications?: File | null
}

interface WorkOrderFormData {
  workOrderSection: {
    workOrderNumber: string
    clientName: string
    jobReference?: string
    clientPONumber?: string
    date?: string
    deliveryDate?: string
    products: ProductItem[]
  }
  salesOrderSection: {
    customerInfo: CustomerInfo
    orderDetails: OrderDetails
    termsAndConditions: TermsAndConditions
    requiredDocuments: RequiredDocuments
    authorizedBy?: string
  }
  purchaseOrderSection: {
    poTable: POItem[]
    shipTo?: string
    paymentTerms?: string
    deliveryTerms?: string
  }
}

export default function EditWorkOrderSalesPage() {
  const router = useRouter()
  const params = useParams()
  const workOrderId = params?.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<WorkOrderFormData>({
    workOrderSection: {
      workOrderNumber: "",
      clientName: "",
      jobReference: "",
      clientPONumber: "",
      date: "",
      deliveryDate: "",
      products: [],
    },
    salesOrderSection: {
      customerInfo: {
        customerName: "",
        salesPerson: "",
        contactPerson: "",
        mobileNo: "",
        phoneNo: "",
        email: "",
      },
      orderDetails: {
        productType: "",
        poNumber: "",
        poDate: "",
        poValue: "",
        deliveryDate: "",
        shopDrawingApproval: false,
        shopDrawingApprovalDate: "",
        expectedCompletionDate: "",
        specialInstructions: "",
      },
      termsAndConditions: {
        paymentType: "",
        pricesIncludeGST: true,
        deliveryMethod: "",
        warrantyPeriod: "",
      },
      requiredDocuments: {
        quotationWithFinalPrice: null,
        approvedShopDrawing: null,
        componentList: null,
        customerPOCopy: null,
        technicalSpecifications: null,
      },
      authorizedBy: "",
    },
    purchaseOrderSection: {
      poTable: [],
      shipTo: "",
      paymentTerms: "",
      deliveryTerms: "",
    },
  })

  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        const res = await fetch(`/api/work-order/${workOrderId}`)
        if (!res.ok) throw new Error("Failed to load work order data")

        const data = await res.json() as WorkOrderFormData
        setFormData(data)
      } catch (err: unknown) {
        console.error("Error fetching work order:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast.error("Failed to load work order")
      } finally {
        setFetching(false)
      }
    }

    if (workOrderId) fetchWorkOrder()
  }, [workOrderId])

  // Generic handler for top-level fields
  const handleChange = <
    T extends keyof WorkOrderFormData,
    K extends keyof WorkOrderFormData[T]
  >(
    section: T,
    key: K,
    value: WorkOrderFormData[T][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  // Specialized handlers for nested objects
  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      salesOrderSection: {
        ...prev.salesOrderSection,
        customerInfo: {
          ...prev.salesOrderSection.customerInfo,
          [field]: value
        }
      }
    }))
  }

  const handleOrderDetailsChange = (field: keyof OrderDetails, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      salesOrderSection: {
        ...prev.salesOrderSection,
        orderDetails: {
          ...prev.salesOrderSection.orderDetails,
          [field]: value
        }
      }
    }))
  }

  const handleTermsChange = (field: keyof TermsAndConditions, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      salesOrderSection: {
        ...prev.salesOrderSection,
        termsAndConditions: {
          ...prev.salesOrderSection.termsAndConditions,
          [field]: value
        }
      }
    }))
  }

  const handleFileChange = (
    field: keyof RequiredDocuments,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      salesOrderSection: {
        ...prev.salesOrderSection,
        requiredDocuments: {
          ...prev.salesOrderSection.requiredDocuments,
          [field]: file
        }
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formDataToSend = new FormData()
      
      Object.entries(formData.salesOrderSection.requiredDocuments).forEach(([key, file]) => {
        if (file instanceof File) {
          formDataToSend.append(`salesOrderSection.requiredDocuments.${key}`, file)
        }
      })

      formDataToSend.append('jsonData', JSON.stringify(formData))

      const res = await fetch(`/api/work-order/${workOrderId}`, {
        method: "PUT",
        body: formDataToSend,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update work order")
      }

      toast.success("Work order updated successfully!", { duration: 4000, position: 'top-center' })
      router.push("/work-orders")
    } catch (err: unknown) {
      console.error("Error updating work order:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error(err instanceof Error ? err.message : "Failed to update work order")
    } finally {
      setLoading(false)
    }
  }

  const addProduct = () => {
    setFormData(prev => ({ 
      ...prev, 
      workOrderSection: { 
        ...prev.workOrderSection, 
        products: [
          ...prev.workOrderSection.products, 
          { 
            serialNumber: "", 
            itemDescription: "", 
            quantity: 1, 
            remarks: "" 
          }
        ] 
      } 
    }))
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      workOrderSection: { 
        ...prev.workOrderSection, 
        products: prev.workOrderSection.products.filter((_, i) => i !== index) 
      } 
    }))
  }

  const updateProduct = (index: number, field: keyof ProductItem, value: string | number) => {
    setFormData(prev => {
      const products = [...prev.workOrderSection.products]
      products[index] = { ...products[index], [field]: value }
      return { 
        ...prev, 
        workOrderSection: { ...prev.workOrderSection, products } 
      }
    })
  }

  const addPOItem = () => {
    setFormData(prev => ({ 
      ...prev, 
      purchaseOrderSection: { 
        ...prev.purchaseOrderSection, 
        poTable: [
          ...prev.purchaseOrderSection.poTable, 
          { 
            description: "", 
            unit: "", 
            quantity: 1, 
            unitRatePKR: 0, 
            totalAmountPKR: 0 
          }
        ] 
      } 
    }))
  }

  const removePOItem = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      purchaseOrderSection: { 
        ...prev.purchaseOrderSection, 
        poTable: prev.purchaseOrderSection.poTable.filter((_, i) => i !== index) 
      } 
    }))
  }

  const updatePOItem = (index: number, field: keyof POItem, value: string | number) => {
    setFormData(prev => {
      const poTable = [...prev.purchaseOrderSection.poTable]
      poTable[index] = { ...poTable[index], [field]: value }
      return {
        ...prev,
        purchaseOrderSection: { ...prev.purchaseOrderSection, poTable },
      }
    })
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <Sidebar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <p className={`text-lg ${dmSans.className} tracking-wide`}>Loading work order data...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Toaster />
      <Sidebar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold text-[#8B5E3C] ${dmSans.className} tracking-wide`}>
          Edit Work Order / Sales Order / PO
        </h1>

        {error && (
          <div className={`mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md text-sm ${dmSans.className} tracking-wide`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Work Order Section */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Work Order Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Work Order Number *" 
                value={formData.workOrderSection.workOrderNumber} 
                onChange={(v) => handleChange("workOrderSection", "workOrderNumber", v)} 
                required 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Client Name *" 
                value={formData.workOrderSection.clientName} 
                onChange={(v) => handleChange("workOrderSection", "clientName", v)} 
                required 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Job Reference" 
                value={formData.workOrderSection.jobReference || ""} 
                onChange={(v) => handleChange("workOrderSection", "jobReference", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Client PO Number" 
                value={formData.workOrderSection.clientPONumber || ""} 
                onChange={(v) => handleChange("workOrderSection", "clientPONumber", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Date *" 
                type="date" 
                value={formData.workOrderSection.date || ""} 
                onChange={(v) => handleChange("workOrderSection", "date", v)} 
                required 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Delivery Date" 
                type="date" 
                value={formData.workOrderSection.deliveryDate || ""} 
                onChange={(v) => handleChange("workOrderSection", "deliveryDate", v)} 
                fontClass={dmSans.className}
              />
            </div>
          </div>

          {/* Work Order Products */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Work Order - Products List
            </h2>
            {formData.workOrderSection.products.map((prod, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 border p-3 rounded mb-3">
                <InputField 
                  label="Serial No" 
                  value={prod.serialNumber || ""} 
                  onChange={(v) => updateProduct(index, "serialNumber", v)} 
                  fontClass={dmSans.className}
                />
                <TextareaField 
                  label="Item Description" 
                  value={prod.itemDescription || ""} 
                  onChange={(v) => updateProduct(index, "itemDescription", v)} 
                  fontClass={dmSans.className}
                />
                <InputField 
                  label="Quantity" 
                  type="number" 
                  value={prod.quantity || ""} 
                  onChange={(v) => updateProduct(index, "quantity", Number(v))} 
                  fontClass={dmSans.className}
                />
                <InputField 
                  label="Remarks" 
                  value={prod.remarks || ""} 
                  onChange={(v) => updateProduct(index, "remarks", v)} 
                  fontClass={dmSans.className}
                />
                <button 
                  type="button" 
                  className={`text-red-500 text-sm mt-2 ${dmSans.className} tracking-wide`} 
                  onClick={() => removeProduct(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className={`mt-2 px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200 ${dmSans.className} tracking-wide`} 
              onClick={addProduct}
            >
              + Add Product
            </button>
          </div>

          {/* Sales Order - Customer Info */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Sales Order - Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Customer Name" 
                value={formData.salesOrderSection.customerInfo.customerName} 
                onChange={(v) => handleCustomerInfoChange("customerName", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Sales Person" 
                value={formData.salesOrderSection.customerInfo.salesPerson || ""} 
                onChange={(v) => handleCustomerInfoChange("salesPerson", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Contact Person" 
                value={formData.salesOrderSection.customerInfo.contactPerson || ""} 
                onChange={(v) => handleCustomerInfoChange("contactPerson", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Email" 
                type="email" 
                value={formData.salesOrderSection.customerInfo.email || ""} 
                onChange={(v) => handleCustomerInfoChange("email", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Mobile No" 
                value={formData.salesOrderSection.customerInfo.mobileNo || ""} 
                onChange={(v) => handleCustomerInfoChange("mobileNo", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Phone No" 
                value={formData.salesOrderSection.customerInfo.phoneNo || ""} 
                onChange={(v) => handleCustomerInfoChange("phoneNo", v)} 
                fontClass={dmSans.className}
              />
            </div>
          </div>

          {/* Sales Order - Order Details */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Sales Order - Order Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Product Type" 
                value={formData.salesOrderSection.orderDetails.productType || ""} 
                onChange={(v) => handleOrderDetailsChange("productType", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="PO Number" 
                value={formData.salesOrderSection.orderDetails.poNumber || ""} 
                onChange={(v) => handleOrderDetailsChange("poNumber", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="PO Date" 
                type="date" 
                value={formData.salesOrderSection.orderDetails.poDate || ""} 
                onChange={(v) => handleOrderDetailsChange("poDate", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="PO Value" 
                type="number" 
                value={formData.salesOrderSection.orderDetails.poValue || ""} 
                onChange={(v) => handleOrderDetailsChange("poValue", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Delivery Date" 
                type="date" 
                value={formData.salesOrderSection.orderDetails.deliveryDate || ""} 
                onChange={(v) => handleOrderDetailsChange("deliveryDate", v)} 
                fontClass={dmSans.className}
              />
              <InputField 
                label="Expected Completion Date" 
                type="date" 
                value={formData.salesOrderSection.orderDetails.expectedCompletionDate || ""} 
                onChange={(v) => handleOrderDetailsChange("expectedCompletionDate", v)} 
                fontClass={dmSans.className}
              />
              <TextareaField 
                label="Special Instructions" 
                value={formData.salesOrderSection.orderDetails.specialInstructions || ""} 
                onChange={(v) => handleOrderDetailsChange("specialInstructions", v)} 
                fontClass={dmSans.className}
              />
              <div className={`flex items-center gap-2 col-span-2 ${dmSans.className} tracking-wide`}>
                <input 
                  type="checkbox" 
                  checked={formData.salesOrderSection.orderDetails.shopDrawingApproval} 
                  onChange={(e) => handleOrderDetailsChange("shopDrawingApproval", e.target.checked)} 
                />
                <label>Shop Drawing Approved?</label>
              </div>
              <InputField  
                label="Approval Date" 
                type="date" 
                value={formData.salesOrderSection.orderDetails.shopDrawingApprovalDate || ""} 
                onChange={(v) => handleOrderDetailsChange("shopDrawingApprovalDate", v)} 
                fontClass={dmSans.className}
              />
            </div>
          </div>

          {/* Sales Order - Terms & Conditions */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Sales Order - Terms & Authorization
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Payment Type"
                value={formData.salesOrderSection.termsAndConditions.paymentType || ""}
                onChange={(v) => handleTermsChange("paymentType", v)}
                options={[
                  { label: "Before Delivery", value: "beforeDelivery" },
                  { label: "After Delivery", value: "afterDelivery" },
                  { label: "Partial Payment", value: "partialPayment" },
                ]}
                fontClass={dmSans.className}
              />
              <SelectField
                label="Delivery Method"
                value={formData.salesOrderSection.termsAndConditions.deliveryMethod || ""}
                onChange={(v) => handleTermsChange("deliveryMethod", v)}
                options={[
                  { label: "By Company", value: "company" },
                  { label: "By Customer", value: "customer" },
                  { label: "Third Party", value: "thirdParty" },
                ]}
                fontClass={dmSans.className}
              />
              <SelectField
                label="Warranty Period"
                value={formData.salesOrderSection.termsAndConditions.warrantyPeriod || ""}
                onChange={(v) => handleTermsChange("warrantyPeriod", v)}
                options={[
                  { label: "1 Year", value: "1year" },
                  { label: "2 Years", value: "2years" },
                  { label: "5 Years", value: "5years" },
                  { label: "10 Years", value: "10years" },
                ]}
                fontClass={dmSans.className}
              />
              <div className={`flex items-center gap-2 ${dmSans.className} tracking-wide`}>
                <input
                  type="checkbox"
                  checked={formData.salesOrderSection.termsAndConditions.pricesIncludeGST}
                  onChange={(e) => handleTermsChange("pricesIncludeGST", e.target.checked)}
                />
                <label>Prices Include GST?</label>
              </div>
              <InputField 
                label="Authorized By" 
                value={formData.salesOrderSection.authorizedBy || ""} 
                onChange={(v) => handleChange("salesOrderSection", "authorizedBy", v)} 
                fontClass={dmSans.className}
              />
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Required Documents
            </h2>
            <FileField 
              label="Quotation with Final Price" 
              onChange={(e) => handleFileChange("quotationWithFinalPrice", e)} 
              fontClass={dmSans.className}
            />
            <FileField 
              label="Approved Shop Drawing" 
              onChange={(e) => handleFileChange("approvedShopDrawing", e)} 
              fontClass={dmSans.className}
            />
            <FileField 
              label="Component List" 
              onChange={(e) => handleFileChange("componentList", e)} 
              fontClass={dmSans.className}
            />
            <FileField 
              label="Customer PO Copy *" 
              required 
              onChange={(e) => handleFileChange("customerPOCopy", e)} 
              fontClass={dmSans.className}
            />
            <FileField 
              label="Technical Specifications" 
              onChange={(e) => handleFileChange("technicalSpecifications", e)} 
              fontClass={dmSans.className}
            />
          </div>

          {/* Purchase Order Items */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Purchase Order - Items List
            </h2>
            {formData.purchaseOrderSection.poTable.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 border p-3 rounded mb-3">
                <TextareaField 
                  label="Description" 
                  value={item.description || ""} 
                  onChange={(v) => updatePOItem(index, "description", v)} 
                  fontClass={dmSans.className}
                />
                <InputField 
                  label="Unit" 
                  value={item.unit || ""} 
                  onChange={(v) => updatePOItem(index, "unit", v)} 
                  fontClass={dmSans.className}
                />
                <InputField 
                  label="Qty" 
                  type="number" 
                  value={item.quantity || ""} 
                  onChange={(v) => updatePOItem(index, "quantity", Number(v))} 
                  fontClass={dmSans.className}
                />
                <InputField 
                  label="Unit Rate (PKR)" 
                  type="number" 
                  value={item.unitRatePKR || ""} 
                  onChange={(v) => updatePOItem(index, "unitRatePKR", Number(v))} 
                  fontClass={dmSans.className}
                />
                <InputField 
                  label="Total Amount (PKR)" 
                  type="number" 
                  value={item.totalAmountPKR || ""} 
                  onChange={(v) => updatePOItem(index, "totalAmountPKR", Number(v))} 
                  fontClass={dmSans.className}
                />
                <button 
                  type="button" 
                  className={`text-red-500 text-sm mt-2 ${dmSans.className} tracking-wide`} 
                  onClick={() => removePOItem(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className={`mt-2 px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200 ${dmSans.className} tracking-wide`} 
              onClick={addPOItem}
            >
              + Add PO Item
            </button>
          </div>

          {/* Purchase Order Details */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 ${dmSans.className} tracking-wide`}>
              Purchase Order Details
            </h2>
            <TextareaField 
              label="Ship To" 
              value={formData.purchaseOrderSection.shipTo || ""} 
              onChange={(v) => handleChange("purchaseOrderSection", "shipTo", v)} 
              fontClass={dmSans.className}
            />
            <TextareaField 
              label="Payment Terms" 
              value={formData.purchaseOrderSection.paymentTerms || ""} 
              onChange={(v) => handleChange("purchaseOrderSection", "paymentTerms", v)} 
              fontClass={dmSans.className}
            />
            <TextareaField 
              label="Delivery Terms" 
              value={formData.purchaseOrderSection.deliveryTerms || ""} 
              onChange={(v) => handleChange("purchaseOrderSection", "deliveryTerms", v)} 
              fontClass={dmSans.className}
            />
          </div>

          <div className={`flex justify-end gap-3 pt-4 border-t ${dmSans.className} tracking-wide`}>
            <button
              type="button"
              onClick={() => router.push('/work-orders')}
              className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 tracking-wide"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-[#8B5E3C] text-white hover:bg-[#6d4a2f] disabled:opacity-50 tracking-wide"
            >
              {loading ? 'Updating...' : 'Update Work Order'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

// Helper Components with TypeScript
interface InputFieldProps {
  label: string
  type?: string
  value: string | number
  onChange: (value: string) => void
  required?: boolean
  fontClass?: string
}

function InputField({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  required = false,
  fontClass = ""
}: InputFieldProps) {
  return (
    <div className={`${fontClass} tracking-wide`}>
      <label className="block text-sm font-medium mb-1 tracking-wide">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-gray-300 rounded-md p-2 ${fontClass} tracking-wide`}
      />
    </div>
  )
}

interface TextareaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  fontClass?: string
  rows?: number
}

function TextareaField({ 
  label, 
  value, 
  onChange,
  fontClass = "",
  rows = 3
}: TextareaFieldProps) {
  return (
    <div className={`${fontClass} tracking-wide`}>
      <label className="block text-sm font-medium mb-1 tracking-wide">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`w-full border border-gray-300 rounded-md p-2 ${fontClass} tracking-wide`}
      />
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  fontClass?: string
}

function SelectField({ 
  label, 
  value, 
  onChange, 
  options,
  fontClass = ""
}: SelectFieldProps) {
  return (
    <div className={`${fontClass} tracking-wide`}>
      <label className="block text-sm font-medium mb-1 tracking-wide">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className={`w-full border border-gray-300 rounded-md p-2 ${fontClass} tracking-wide`}
      >
        <option value="">Select...</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value} className={`${fontClass} tracking-wide`}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

interface FileFieldProps {
  label: string
  required?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fontClass?: string
}

function FileField({ 
  label, 
  required = false, 
  onChange,
  fontClass = ""
}: FileFieldProps) {
  return (
    <div className={`mb-4 ${fontClass} tracking-wide`}>
      <label className="block font-medium text-sm mb-1 tracking-wide">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input 
        type="file" 
        required={required} 
        onChange={onChange} 
        className={`block w-full text-sm border rounded p-2 ${fontClass} tracking-wide`} 
      />
    </div>
  )
}