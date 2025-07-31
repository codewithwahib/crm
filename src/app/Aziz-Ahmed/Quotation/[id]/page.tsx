/** ✅ FORCE DYNAMIC RENDERING */
export const dynamic = "force-dynamic";    // ✅ always dynamic
export const fetchCache = "force-no-store"; // ✅ avoid caching
export const revalidate = 0;                // ✅ no ISR

import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import { DM_Sans } from "next/font/google";
import ProtectedRoute from "@/app/Components/ProtectedRoute";
import Sidebar from "@/app/Aziz-Ahmed/Components/sidebar";

/* ✅ Google Font */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

/* ✅ Next.js PageProps */
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
  subtotal?: number;
  gst?: number;
  totalPrice?: number;
  termsAndConditions?: TermsAndConditions;
  notes?: Notes;
  quotationAttachments?: FileAttachment[];
  drawingAttachments?: FileAttachment[];
  sldDocument?: FileAttachment;
  status?: string;
}

export default async function QuotationDetailPage({ params }: PageProps) {
  const { id } = params;

  /* ✅ GROQ Query */
  const query = `
    *[_type == "quotation" && quotationId == $id && lower(salesPerson) == "Aziz Ahmed"][0] {
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
  `;

  /* ✅ FETCH SANITY DATA - NO STORE CACHE */
  const data: QuotationData | null = await client.fetch(
    query,
    { id },
    { cache: "no-store" } // ✅ prevent any fetch caching
  );

  // ✅ If no data or not assigned to "Anas Nayyar"
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
    subtotal = 0,
    gst = 0,
    totalPrice = 0,
    quotationAttachments = [],
    drawingAttachments = [],
    sldDocument,
  } = data;

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
    < ProtectedRoute allowedUser="sales-manager">
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable}`}>
      <Sidebar />
      <main className={`max-w-6xl mx-auto px-4 py-10 space-y-8 ${dmSans.className}`}>
        {/* ✅ HEADER */}
        <div className="flex justify-between items-start border-b pb-6">
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold pt-10 tracking-wide text-[#8B5E3C]`}>
              {quotationId}
            </h1>

            {subject && (
              <h2 className={`text-xl tracking-wide text-gray-600`}>
                <span className="font-semibold text-[#8B5E3C]">Subject:</span>{" "}
                {subject}
              </h2>
            )}

            <div className="flex items-center gap-2 tracking-wide">
              <span className="font-semibold text-[#8B5E3C]">Status:</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
              >
                {safeStatus}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ CLIENT + QUOTATION INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Information */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2`}>
              Client Information
            </h2>
            <div className="space-y-3 tracking-wide">
              {clientName && (
                <div>
                  <p className="text-xl font-bold text-gray-600">Client Name:</p>
                  <p className="text-lg">{clientName}</p>
                </div>
              )}
              {company && (
                <div>
                  <p className="text-xl font-bold text-gray-600">Company:</p>
                  <p className="text-lg">{company}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {customerEmail && (
                  <div>
                    <p className="text-xl font-bold text-gray-600">Email:</p>
                    <p className="text-lg">{customerEmail}</p>
                  </div>
                )}
                {customerPhone && (
                  <div>
                    <p className="text-xl font-bold text-gray-600">Phone:</p>
                    <p className="text-lg">{customerPhone}</p>
                  </div>
                )}
              </div>

              {address && (
                <div>
                  <p className="text-xl font-bold text-gray-600">Address:</p>
                  <p className="text-lg">{address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quotation Details */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2`}>
              Quotation Details
            </h2>
            <div className="space-y-3 tracking-wide">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xl font-bold text-gray-600">Reference No:</p>
                  <p className="text-lg">{referenceNo}</p>
                </div>
                {ferencNumber && (
                  <div>
                    <p className="text-xl font-bold text-gray-600">FERENC No:</p>
                    <p className="text-lg">{ferencNumber}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xl font-bold text-gray-600">Date:</p>
                  <p className="text-lg">{formatDate(date)}</p>
                </div>
                {sentDate && (
                  <div>
                    <p className="text-xl font-bold text-gray-600">Sent Date:</p>
                    <p className="text-lg">{formatDate(sentDate)}</p>
                  </div>
                )}
              </div>

              {receivingDate && (
                <div>
                  <p className={`text-xl font-bold text-gray-600`}>
                    Received Date:
                  </p>
                  <p className={`text-lg`}>
                    {formatDate(receivingDate)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {preparedBy && (
                  <div>
                    <p className={`text-xl font-bold text-gray-600`}>
                      Prepared By:
                    </p>
                    <p className={`text-lg`}>
                      {preparedBy}
                    </p>
                  </div>
                )}
                {salesPerson && (
                  <div>
                    <p className={`text-xl font-bold text-gray-600`}>
                      Sales Person:
                    </p>
                    <p className={`text-lg`}>
                      {salesPerson}
                    </p>
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
              <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2`}>
                Project Information
              </h2>
              <p className={`text-lg tracking-wide`}>
                {projectName}
              </p>
            </div>
          )}

          {revision && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2`}>
                Revision Details
              </h2>
              <div className="space-y-3 tracking-wide">
                <div>
                  <p className={`text-xl font-bold text-gray-600`}>
                    Revision:
                  </p>
                  <p className={`text-lg`}>
                    {revision}
                  </p>
                </div>
                {revisionDate && (
                  <div>
                    <p className={`text-xl font-bold text-gray-600`}>
                      Revision Date:
                    </p>
                    <p className={`text-lg`}>
                      {formatDate(revisionDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Products Table */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] p-6 pb-4`}>
            Quoted Items
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 tracking-wide text-left text-sm font-medium text-gray-700 uppercase`}>
                    S No.
                  </th>
                  <th className={`px-6 py-3 tracking-wide text-left text-sm font-medium text-gray-700 uppercase`}>
                    Description
                  </th>
                  <th className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-700 uppercase`}>
                    Qty
                  </th>
                  <th className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-700 uppercase`}>
                    Unit Price
                  </th>
                  <th className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-700 uppercase`}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(products) && products.length > 0 ? (
                  products.map((item, i) => {
                    const quantity = Number(item.quantity ?? 0);
                    const unitPrice = Number(item.unitPrice ?? 0);
                    const totalPrice =
                      item.totalPrice ?? unitPrice * quantity;

                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className={`px-6 py-4 tracking-wide`}>
                          {i + 1}.
                        </td>
                        <td className={`px-6 py-4 text-gray-500 tracking-wide`}>
                          {item.description || item.itemName || "N/A"}
                        </td>
                        <td className={`px-6 py-4 text-right tracking-wide`}>
                          {quantity}
                        </td>
                        <td className={`px-6 py-4 text-right tracking-wide`}>
                          {unitPrice.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium tracking-wide`}>
                          {totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-400 italic tracking-wide"
                    >
                      No products available
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={4}
                    className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-500`}
                  >
                    Subtotal:
                  </td>
                  <td
                    className={`px-6 py-3 text-right tracking-wide text-sm font-medium`}
                  >
                    Rs. {subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={4}
                    className={`px-6 py-3 tracking-wide text-right text-sm font-medium text-gray-500`}
                  >
                    GST (18%):
                  </td>
                  <td
                    className={`px-6 py-3 text-right tracking-wide text-sm font-medium`}
                  >
                    Rs. {gst.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td
                    colSpan={4}
                    className={`px-6 py-3 tracking-wide text-right text-sm font-bold text-gray-900`}
                  >
                    Total Amount:
                  </td>
                  <td
                    className={`px-6 py-3 text-right tracking-wide text-sm font-bold text-[#8B5E3C]`}
                  >
                    Rs. {totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ✅ Attachments */}
        {(quotationAttachments?.length > 0 ||
          drawingAttachments?.length > 0 ||
          sldDocument) && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2`}>
              Attachments
            </h2>

            <div className="grid tracking-wide grid-cols-1 md:grid-cols-2 gap-6">
              {quotationAttachments?.length > 0 && (
                <AttachmentList
                  title="Quotation Documents"
                  files={quotationAttachments}
                />
              )}
              {drawingAttachments?.length > 0 && (
                <AttachmentList
                  title="Technical Drawings"
                  files={drawingAttachments}
                />
              )}
              {sldDocument && (
                <AttachmentList
                  title="Single Line Diagram (SLD)"
                  files={[sldDocument]}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
    </ProtectedRoute>
  );
}

// ✅ Attachments list with font applied
function AttachmentList({
  title,
  files,
}: {
  title: string;
  files: FileAttachment[];
}) {
  return (
    <div>
      <h3 className={`text-lg font-medium tracking-wide text-[#8B5E3C] mb-3`}>
        {title}
      </h3>
      <ul className="space-y-2 tracking-wide">
        {files.map((file, i) => (
          <li key={i} className={`flex items-center`}>
            📄{" "}
            <a
              href={file.asset?.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-600 hover:underline flex-1 tracking-wide`}
            >
              {file.asset?.originalFilename || "Document"}
            </a>
            {file.asset?.size && (
              <span className={`text-xs text-gray-500 ml-2 tracking-wide`}>
                {(file.asset.size / 1024).toFixed(1)} KB
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}