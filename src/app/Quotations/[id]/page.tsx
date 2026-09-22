export const dynamic = "force-dynamic"; // ✅ Ensures fresh Sanity data every render

import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import ProtectedRoute from "@/app/Components/ProtectedRoute";
import { DM_Sans } from "next/font/google";
import Sidebar from '@/app/Components/sidebar'

/* ✅ Google Font */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

/* ✅ Next.js 15 proper PageProps */
interface PageProps {
  params: {
    id: string;
  };
}

/* ✅ Status types */
type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";

/* ✅ Interfaces */
interface Product {
  itemName?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

interface FileAttachment {
  asset?: {
    url?: string;
    originalFilename?: string;
    size?: number;
  };
}

interface TermsAndConditions {
  _type: string;
  children: { _type: string; marks: string[]; text: string }[];
}

interface Notes {
  _type: string;
  children: { _type: string; marks: string[]; text: string }[];
}

interface QuotationData {
  quotationId: string;
  referenceNo: string;
  ferencNumber?: string;
  date?: string;
  client?: string;
  company?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  projectName?: string;
  subject?: string;
  sentDate?: string;
  receivingDate?: string;
  revision?: string;
  revisionDate?: string;
  salesPerson?: string;
  preparedBy?: string;
  products?: Product[];
  subtotal?: number | null;
  discount?: number | null;
  gst?: number | null;
  totalPrice?: number | null;
  termsAndConditions?: TermsAndConditions;
  notes?: Notes;
  quotationAttachments?: FileAttachment[];
  drawingAttachments?: FileAttachment[];
  sldDocument?: FileAttachment;
  otherDocuments?: FileAttachment[];
  status?: string;
}

/* ✅ Safe number helper */
const safeNum = (val: number | null | undefined): number => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

export default async function QuotationDetailPage({ params }: PageProps) {
  const { id } = params;

  /* ✅ GROQ Query */
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
      discount,
      gst,
      totalPrice,
      termsAndConditions,
      quotationAttachments[]{..., asset->},
      drawingAttachments[]{..., asset->},
      sldDocument{..., asset->},
      otherDocuments[]{..., asset->},
      notes
    }
  `;

  const data: QuotationData | null = await client.fetch(query, { id });

  if (!data) return notFound();

  /* ✅ Destructure safely with defaults */
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
    status = "Draft",
    revision,
    sentDate,
    receivingDate,
    revisionDate,
    customerEmail,
    customerPhone,
    address,
    products = [],
    quotationAttachments = [],
    drawingAttachments = [],
    sldDocument,
    otherDocuments = [],
  } = data;

  /* ✅ Safe numeric values (handles null, undefined, NaN) */
  const safeSubtotal = safeNum(data.subtotal);
  const safeDiscount = safeNum(data.discount);
  const safeGst = safeNum(data.gst);
  const safeTotalPrice = safeNum(data.totalPrice);

  /* ✅ Status color mapping */
  const statusColors: Record<QuotationStatus, string> = {
    Draft: "bg-yellow-100 text-yellow-700",
    Sent: "bg-blue-100 text-blue-700",
    Accepted: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Expired: "bg-gray-100 text-gray-700",
  };

  /* ✅ Validate status */
  const safeStatus: QuotationStatus = [
    "Draft",
    "Sent",
    "Accepted",
    "Rejected",
    "Expired",
  ].includes(status as QuotationStatus)
    ? (status as QuotationStatus)
    : "Draft";

  const statusColor = statusColors[safeStatus];

  /* ✅ Date Formatter */
  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  return (
    <ProtectedRoute allowedUser="director">
      <div className="min-h-screen bg-white text-gray-800">
        <Sidebar />
        <main className="max-w-6xl pt-16 mx-auto px-4 py-6">
          {/* ✅ HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b pb-6">
            <div className="space-y-2 tracking-wide w-full md:w-auto">
              <h1
                className={`text-2xl font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}
              >
                {quotationId}
              </h1>

              {subject && (
                <h2 className={`text-lg text-gray-600 tracking-wide ${dmSans.className}`}>
                  <span className={`font-semibold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
                    Subject:
                  </span>{" "}
                  {subject}
                </h2>
              )}

              <div className={`flex items-center gap-2 tracking-wide ${dmSans.className}`}>
                <span className={`font-semibold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>Status:</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium tracking-wide ${statusColor} ${dmSans.className}`}
                >
                  {safeStatus}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ CLIENT + QUOTATION INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-6">
            {/* Client Information */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 tracking-wide ${dmSans.className}`}>
                Client Information
              </h2>
              <div className="space-y-3">
                {clientName && (
                  <div>
                    <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Client Name:</p>
                    <p className={`text-sm tracking-wide ${dmSans.className}`}>{clientName}</p>
                  </div>
                )}
                {company && (
                  <div>
                    <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Company:</p>
                    <p className={`text-sm tracking-wide ${dmSans.className}`}>{company}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customerEmail && (
                    <div>
                      <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Email:</p>
                      <p className={`text-sm tracking-wide ${dmSans.className}`}>{customerEmail}</p>
                    </div>
                  )}
                  {customerPhone && (
                    <div>
                      <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Phone:</p>
                      <p className={`text-sm tracking-wide ${dmSans.className}`}>{customerPhone}</p>
                    </div>
                  )}
                </div>

                {address && (
                  <div>
                    <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Address:</p>
                    <p className={`text-sm tracking-wide ${dmSans.className}`}>{address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quotation Details */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 tracking-wide ${dmSans.className}`}>
                Quotation Details
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Reference No:</p>
                    <p className={`text-sm tracking-wide ${dmSans.className}`}>{referenceNo}</p>
                  </div>
                  {ferencNumber && (
                    <div>
                      <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>FERENC No:</p>
                      <p className={`text-sm tracking-wide ${dmSans.className}`}>{ferencNumber}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Date:</p>
                    <p className={`text-sm tracking-wide ${dmSans.className}`}>{formatDate(date)}</p>
                  </div>
                  {sentDate && (
                    <div>
                      <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Sent Date:</p>
                      <p className={`text-sm tracking-wide ${dmSans.className}`}>{formatDate(sentDate)}</p>
                    </div>
                  )}
                </div>

                {receivingDate && (
                  <div>
                    <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Received Date:</p>
                    <p className={`text-sm tracking-wide ${dmSans.className}`}>{formatDate(receivingDate)}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {preparedBy && (
                    <div>
                      <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Prepared By:</p>
                      <p className={`text-sm tracking-wide ${dmSans.className}`}>{preparedBy}</p>
                    </div>
                  )}
                  {salesPerson && (
                    <div>
                      <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Sales Person:</p>
                      <p className={`text-sm tracking-wide ${dmSans.className}`}>{salesPerson}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Project & Revision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-6">
            {projectName && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 tracking-wide ${dmSans.className}`}>
                  Project Information
                </h2>
                <p className={`text-sm tracking-wide ${dmSans.className}`}>{projectName}</p>
              </div>
            )}

            {revision && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 tracking-wide ${dmSans.className}`}>
                  Revision Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Revision:</p>
                    <p className={`text-sm tracking-wide ${dmSans.className}`}>{revision}</p>
                  </div>
                  {revisionDate && (
                    <div>
                      <p className={`text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>Revision Date:</p>
                      <p className={`text-sm tracking-wide ${dmSans.className}`}>{formatDate(revisionDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ✅ Products Table */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mt-6">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 tracking-wide ${dmSans.className}`}>
              Quoted Items
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className={`px-4 py-2 text-left text-sm font-medium text-gray-700 uppercase tracking-wide ${dmSans.className}`}>S No.</th>
                    <th className={`px-4 py-2 text-left text-sm font-medium text-gray-700 uppercase tracking-wide ${dmSans.className}`}>Item Name</th>
                    <th className={`px-4 py-2 text-left text-sm font-medium text-gray-700 uppercase tracking-wide ${dmSans.className}`}>Description</th>
                    <th className={`px-4 py-2 text-right text-sm font-medium text-gray-700 uppercase tracking-wide ${dmSans.className}`}>Qty</th>
                    <th className={`px-4 py-2 text-right text-sm font-medium text-gray-700 uppercase tracking-wide ${dmSans.className}`}>Unit Price</th>
                    <th className={`px-4 py-2 text-right text-sm font-medium text-gray-700 uppercase tracking-wide ${dmSans.className}`}>Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(products) && products.length > 0 ? (
                    products.map((item, i) => {
                      const quantity = safeNum(item.quantity);
                      const unitPrice = safeNum(item.unitPrice);
                      const itemTotal = safeNum(item.totalPrice) || unitPrice * quantity;

                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className={`px-4 py-3 text-sm tracking-wide ${dmSans.className}`}>{i + 1}.</td>
                          <td className={`px-4 py-3 text-sm text-gray-600 tracking-wide ${dmSans.className}`}>
                            {item.itemName || "N/A"}
                          </td>
                          <td className={`px-4 py-3 text-sm text-gray-500 tracking-wide ${dmSans.className}`}>
                            {item.description || "—"}
                          </td>
                          <td className={`px-4 py-3 text-right text-sm tracking-wide ${dmSans.className}`}>{quantity}</td>
                          <td className={`px-4 py-3 text-right text-sm tracking-wide ${dmSans.className}`}>{unitPrice.toFixed(2)}</td>
                          <td className={`px-4 py-3 text-right font-medium text-sm tracking-wide ${dmSans.className}`}>
                            {itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className={`px-6 py-4 text-center text-gray-400 italic text-sm tracking-wide ${dmSans.className}`}
                      >
                        No products available
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot className="bg-gray-100">
                  <tr>
                    <td colSpan={5} className={`px-4 py-3 text-right text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>
                      Subtotal:
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-medium tracking-wide ${dmSans.className}`}>
                      Rs. {safeSubtotal.toFixed(2)}
                    </td>
                  </tr>
                  {safeDiscount > 0 && (
                    <tr>
                      <td colSpan={5} className={`px-4 py-3 text-right text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>
                        Discount:
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-medium tracking-wide ${dmSans.className}`}>
                        Rs. {safeDiscount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={5} className={`px-4 py-3 text-right text-sm font-medium text-gray-600 tracking-wide ${dmSans.className}`}>
                      GST ( 18% ):
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-medium tracking-wide ${dmSans.className}`}>
                      Rs. {safeGst.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td colSpan={5} className={`px-4 py-3 text-right text-sm font-bold text-gray-900 tracking-wide ${dmSans.className}`}>
                      Total Amount:
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
                      Rs. {safeTotalPrice.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ✅ Attachments */}
          {(quotationAttachments?.length > 0 || drawingAttachments?.length > 0 || sldDocument || otherDocuments?.length > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm mt-6">
              <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 tracking-wide ${dmSans.className}`}>
                Attachments
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quotationAttachments?.length > 0 && (
                  <AttachmentList title="Quotation Documents" files={quotationAttachments} fontClass={dmSans.className} />
                )}
                {drawingAttachments?.length > 0 && (
                  <AttachmentList title="Technical Drawings" files={drawingAttachments} fontClass={dmSans.className} />
                )}
                {sldDocument && (
                  <AttachmentList title="Single Line Diagram (SLD)" files={[sldDocument]} fontClass={dmSans.className} />
                )}
                {otherDocuments?.length > 0 && (
                  <AttachmentList title="Other Documents" files={otherDocuments} fontClass={dmSans.className} />
                )}
              </div>
            </div>
          )}

          {/* ✅ Terms & Conditions and Notes */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mt-6">
            <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-3 border-b pb-2 tracking-wide ${dmSans.className}`}>
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-sm font-medium text-gray-600 mb-2 tracking-wide ${dmSans.className}`}>Terms & Conditions</h3>
                <div className={`text-sm text-gray-700 bg-white p-3 rounded border ${dmSans.className}`}>
                  {data.termsAndConditions ? (
                    <div>
                      {data.termsAndConditions.children?.map((child, i) => (
                        <p key={i} className="mb-2 tracking-wide">{child.text}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic tracking-wide">No terms and conditions provided</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className={`text-sm font-medium text-gray-600 mb-2 tracking-wide ${dmSans.className}`}>Internal Notes</h3>
                <div className={`text-sm text-gray-700 bg-white p-3 rounded border ${dmSans.className}`}>
                  {data.notes ? (
                    <div>
                      {data.notes.children?.map((child, i) => (
                        <p key={i} className="mb-2 tracking-wide">{child.text}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic tracking-wide">No internal notes</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ✅ Attachments list with font applied
function AttachmentList({ title, files, fontClass }: { title: string; files: FileAttachment[]; fontClass: string }) {
  return (
    <div>
      <h3 className={`text-sm font-medium text-[#8B5E3C] mb-2 tracking-wide ${fontClass}`}>{title}</h3>
      <ul className="space-y-2">
        {files.map((file, i) => (
          <li key={i} className={`flex items-center text-sm tracking-wide ${fontClass}`}>
            📄{' '}
            <a
              href={file.asset?.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-600 hover:underline flex-1 ml-2 tracking-wide ${fontClass}`}
            >
              {file.asset?.originalFilename || 'Document'}
            </a>
            {file.asset?.size && (
              <span className={`text-xs text-gray-500 ml-2 tracking-wide ${fontClass}`}>
                {(file.asset.size / 1024).toFixed(1)} KB
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}