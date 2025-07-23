export const dynamic = 'force-dynamic' // ✅ Ensures fresh Sanity data every render

import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Components/sidebar'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

interface Params {
  params: { id: string }
}

type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired'

interface Product {
  itemName?: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice?: number
}

interface FileAttachment {
  asset?: {
    url?: string
    originalFilename?: string
    size?: number
  }
}

interface QuotationData {
  quotationId: string
  referenceNo: string
  ferencNumber?: string
  date?: string
  client?: string
  company?: string
  customerEmail?: string
  customerPhone?: string
  address?: string
  projectName?: string
  subject?: string
  sentDate?: string
  receivingDate?: string
  revision?: string
  revisionDate?: string
  salesPerson?: string
  preparedBy?: string
  products?: Product[]
  subtotal?: number
  gst?: number
  totalPrice?: number
  termsAndConditions?: any
  notes?: any
  quotationAttachments?: FileAttachment[]
  drawingAttachments?: FileAttachment[]
  sldDocument?: FileAttachment
  status?: string
}

export default async function QuotationDetailPage({ params }: Params) {
  const query = `
    *[_type == "quotation" && quotationId == $id][0] {
      quotationId,
      referenceNo,
      ferencNumber,
      date,
      status,
      client,
      company,
      customerEmail,
      customerPhone,
      address,
      projectName,
      subject,
      sentDate,
      receivingDate,
      revision,
      revisionDate,
      salesPerson,
      preparedBy,
      products[] {
        itemName,
        description,
        quantity,
        unitPrice,
        totalPrice
      },
      subtotal,
      gst,
      totalPrice,
      termsAndConditions,
      quotationAttachments[]{..., asset->},
      drawingAttachments[]{..., asset->},
      sldDocument{..., asset->},
      notes
    }
  `

  const data: QuotationData | null = await client.fetch(query, { id: params.id })
  if (!data) return notFound()

  const {
    quotationId,
    referenceNo,
    ferencNumber,
    date,
    client: clientName,
    company,
    projectName,
    subject,
    preparedBy,
    salesPerson,
    status = 'Draft',
    revision,
    sentDate,
    receivingDate,
    revisionDate,
    termsAndConditions,
    notes,
    customerEmail,
    customerPhone,
    address,
    products = [],
    subtotal = 0,
    gst = 0,
    totalPrice = 0,
    quotationAttachments = [],
    drawingAttachments = [],
    sldDocument,
  } = data

  const statusColors: Record<QuotationStatus, string> = {
    Draft: 'bg-yellow-100 text-yellow-700',
    Sent: 'bg-blue-100 text-blue-700',
    Accepted: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Expired: 'bg-gray-100 text-gray-700',
  }

  const safeStatus: QuotationStatus =
    ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'].includes(status as QuotationStatus)
      ? (status as QuotationStatus)
      : 'Draft'

  const statusColor = statusColors[safeStatus]

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—'

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Sidebar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* ✅ Header Section */}
        <div className="flex justify-between items-start border-b pb-6">
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold tracking-wide text-[#8B5E3C] ${dmSans.className}`}>{quotationId}</h1>

            {subject && (
              <h2 className={`text-xl text-gray-600 ${dmSans.className}`}>
                <span className={`font-semibold tracking-wide text-[#8B5E3C] ${dmSans.className}`}>Subject:</span> {subject}
              </h2>
            )}

            <div className={`flex items-center gap-2 ${dmSans.className}`}>
              <span className={`font-semibold tracking-wide text-[#8B5E3C] ${dmSans.className}`}>Status:</span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor} ${dmSans.className}`}>
                {safeStatus}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Client & Quotation Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Information */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2 ${dmSans.className}`}>
              Client Information
            </h2>
            <div className="space-y-3">
              {clientName && (
                <div>
                  <p className={`text-xl font-bold tracking-wide text-gray-600 ${dmSans.className}`}>Client Name:</p>
                  <p className={`text-lg tracking-wide ${dmSans.className}`}>{clientName}</p>
                </div>
              )}
              {company && (
                <div>
                  <p className={`text-xl tracking-wide font-bold text-gray-600 ${dmSans.className}`}>Company:</p>
                  <p className={`text-lg tracking-wide ${dmSans.className}`}>{company}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {customerEmail && (
                  <div>
                    <p className={`text-xl font-bold tracking-wide text-gray-600 ${dmSans.className}`}>Email:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{customerEmail}</p>
                  </div>
                )}
                {customerPhone && (
                  <div>
                    <p className={`text-xl font-bold tracking-wide text-gray-600 ${dmSans.className}`}>Phone:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{customerPhone}</p>
                  </div>
                )}
              </div>

              {address && (
                <div>
                  <p className={`text-xl font-bold tracking-wide text-gray-600 ${dmSans.className}`}>Address:</p>
                  <p className={`text-lg tracking-wide ${dmSans.className}`}>{address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quotation Details */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2 ${dmSans.className}`}>
              Quotation Details
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xl font-bold tracking-wide text-gray-600 ${dmSans.className}`}>Reference No:</p>
                  <p className={`text-lg tracking-wide ${dmSans.className}`}>{referenceNo}</p>
                </div>
                {ferencNumber && (
                  <div>
                    <p className={`text-xl  tracking-wide font-bold text-gray-600 ${dmSans.className}`}>FERENC No:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{ferencNumber}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xl tracking-wide font-bold text-gray-600 ${dmSans.className}`}>Date:</p>
                  <p className={`text-lg tracking-wide  ${dmSans.className}`}>{formatDate(date)}</p>
                </div>
                {sentDate && (
                  <div>
                    <p className={`text-xl tracking-wide font-bold text-gray-600 ${dmSans.className}`}>Sent Date:</p>
                    <p className={`text-lg tracking-wide${dmSans.className}`}>{formatDate(sentDate)}</p>
                  </div>
                )}
              </div>

              {receivingDate && (
                <div>
                  <p className={`text-xl tracking-wide font-bold text-gray-600 ${dmSans.className}`}>Received Date:</p>
                  <p className={`text-lg tracking-wide ${dmSans.className}`}>{formatDate(receivingDate)}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {preparedBy && (
                  <div>
                    <p className={`text-xl tracking-wide font-bold text-gray-600 ${dmSans.className}`}>Prepared By:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{preparedBy}</p>
                  </div>
                )}
                {salesPerson && (
                  <div>
                    <p className={`text-xl tracking-wide font-bold text-gray-600 ${dmSans.className}`}>Sales Person:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{salesPerson}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Project & Revision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projectName && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2 ${dmSans.className}`}>
                Project Information
              </h2>
              <p className={`text-lg tracking-wider ${dmSans.className}`}>{projectName}</p>
            </div>
          )}

          {revision && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2 ${dmSans.className}`}>
                Revision Details
              </h2>
              <div className="space-y-3">
                <div>
                  <p className={`text-xl font-bold tracking-wide text-gray-600 ${dmSans.className}`}>Revision:</p>
                  <p className={`text-lg tracking-wide ${dmSans.className}`}>{revision}</p>
                </div>
                {revisionDate && (
                  <div>
                    <p className={`text-xl tracking-wide font-bold text-gray-600 ${dmSans.className}`}>Revision Date:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{formatDate(revisionDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Products Table */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] p-6 pb-4 ${dmSans.className}`}>Quoted Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 tracking-wide text-left text-sm font-medium text-gray-700 uppercase ${dmSans.className}`}>S No.</th>
                  <th className={`px-6 py-3 tracking-wide text-left text-sm font-medium text-gray-700 uppercase ${dmSans.className}`}>Description</th>
                  <th className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-700 uppercase ${dmSans.className}`}>Qty</th>
                  <th className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-700 uppercase ${dmSans.className}`}>Unit Price</th>
                  <th className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-700 uppercase ${dmSans.className}`}>Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className={`px-6 py-4 ${dmSans.className}`}>{i + 1}.</td>
                    <td className={`px-6 py-4 text-gray-500 ${dmSans.className}`}>
                      {item.description || item.itemName}
                    </td>
                    <td className={`px-6 py-4 text-right ${dmSans.className}`}>{item.quantity}</td>
                    <td className={`px-6 py-4 text-right ${dmSans.className}`}>{item.unitPrice.toFixed(2)}</td>
                    <td className={`px-6 py-4 text-right font-medium ${dmSans.className}`}>
                      {(item.totalPrice ?? item.unitPrice * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-500 ${dmSans.className}`}>
                    Subtotal:
                  </td>
                  <td className={`px-6 py-3 text-right tracking-wide text-sm font-medium ${dmSans.className}`}>
                    Rs. {subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-500 ${dmSans.className}`}>
                    GST (18%):
                  </td>
                  <td className={`px-6 py-3 text-right tracking-wide text-sm font-medium ${dmSans.className}`}>
                    Rs. {gst.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td colSpan={4} className={`px-6 py-3 tracking-wide text-right text-sm font-bold text-gray-900 ${dmSans.className}`}>
                    Total Amount:
                  </td>
                  <td className={`px-6 py-3 text-right tracking-wide text-sm font-bold text-[#8B5E3C] ${dmSans.className}`}>
                    Rs. {totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ✅ Attachments */}
        {(quotationAttachments.length > 0 || drawingAttachments.length > 0 || sldDocument) && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2 ${dmSans.className}`}>
              Attachments
            </h2>

            <div className="grid tracking-wide grid-cols-1 md:grid-cols-2 gap-6">
              {quotationAttachments.length > 0 && (
                <AttachmentList title="Quotation Documents" files={quotationAttachments} />
              )}
              {drawingAttachments.length > 0 && (
                <AttachmentList title="Technical Drawings" files={drawingAttachments} />
              )}
              {sldDocument && <AttachmentList title="Single Line Diagram (SLD)" files={[sldDocument]} />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ✅ Attachments list with font applied
function AttachmentList({ title, files }: { title: string; files: FileAttachment[] }) {
  return (
    <div>
      <h3 className={`text-lg font-medium text-[#8B5E3C] mb-3 ${dmSans.className}`}>{title}</h3>
      <ul className="space-y-2">
        {files.map((file, i) => (
          <li key={i} className={`flex items-center ${dmSans.className}`}>
            📄{' '}
            <a
              href={file.asset?.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-600 hover:underline flex-1 ${dmSans.className}`}
            >
              {file.asset?.originalFilename || 'Document'}
            </a>
            {file.asset?.size && (
              <span className={`text-xs text-gray-500 ml-2 ${dmSans.className}`}>
                {(file.asset.size / 1024).toFixed(1)} KB
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
