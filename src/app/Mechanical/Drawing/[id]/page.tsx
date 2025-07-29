export const dynamic = "force-dynamic"; // ✅ Ensures fresh Sanity data every render

import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import { DM_Sans } from "next/font/google";
import Sidebar from "@/app/Mechanical/Components/sidebar";

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

/* ✅ Interfaces */
interface Product {
  serialNumber?: string;
  itemDescription?: string;
  quantity: number;
  remarks?: string;
}

// interface FileAttachment {
//   url?: string;
//   name?: string;
// }

interface RequiredDocuments {
  approvedShopDrawingUrl?: string;
  approvedShopDrawingName?: string;
  componentListUrl?: string;
  componentListName?: string;
}

interface WorkOrderSalesOrder {
  _id: string;
  workOrderSection?: {
    clientName?: string;
    workOrderNumber?: string;
    jobReference?: string;
    clientPONumber?: string;
    deliveryDate?: string;
    products?: Product[];
  };
  salesOrderSection?: {
    requiredDocuments?: RequiredDocuments;
  };
}

export default async function WorkOrderDetailPage({ params }: PageProps) {
  const { id } = params;

  /* ✅ GROQ Query */
  const query = `
    *[_type == "workOrderSalesOrder" && _id == $id][0] {
      _id,
      workOrderSection{
        clientName,
        workOrderNumber,
        jobReference,
        clientPONumber,
        deliveryDate,
        products[]{
          serialNumber,
          itemDescription,
          quantity,
          remarks
        }
      },
      salesOrderSection{
        requiredDocuments{
          "approvedShopDrawingUrl": approvedShopDrawing.asset->url,
          "approvedShopDrawingName": approvedShopDrawing.asset->originalFilename,
          "componentListUrl": componentList.asset->url,
          "componentListName": componentList.asset->originalFilename
        }
      }
    }
  `;

  const data: WorkOrderSalesOrder | null = await client.fetch(query, { id });

  if (!data) return notFound();

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
    <div className="min-h-screen bg-white text-gray-800">
      <Sidebar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* ✅ HEADER */}
        <div className="flex justify-between items-start border-b pb-6">
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold pt-10 tracking-wide text-[#8B5E3C] ${dmSans.className}`}>
              {data.workOrderSection?.workOrderNumber || "Work Order"}
            </h1>
            {data.workOrderSection?.clientName && (
              <h2 className={`text-xl text-gray-600 tracking-wide ${dmSans.className}`}>
                <span className={`font-semibold text-[#8B5E3C] ${dmSans.className}`}>Client:</span>{" "}
                <span className={dmSans.className}>{data.workOrderSection.clientName}</span>
              </h2>
            )}
          </div>
        </div>

        {/* ✅ CLIENT + WORK ORDER INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Information */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 border-b pb-2 tracking-wide ${dmSans.className}`}>
              Client Information
            </h2>
            <div className="space-y-3">
              {data.workOrderSection?.clientName && (
                <div>
                  <p className={`text-xl font-bold text-gray-600 tracking-wide ${dmSans.className}`}>Client Name:</p>
                  <p className={`text-lg tracking-wide ${dmSans.className}`}>{data.workOrderSection.clientName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Work Order Details */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 border-b pb-2 tracking-wide ${dmSans.className}`}>
              Work Order Details
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {data.workOrderSection?.workOrderNumber && (
                  <div>
                    <p className={`text-xl font-bold text-gray-600 tracking-wide ${dmSans.className}`}>Work Order No:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{data.workOrderSection.workOrderNumber}</p>
                  </div>
                )}
                {data.workOrderSection?.jobReference && (
                  <div>
                    <p className={`text-xl font-bold text-gray-600 tracking-wide ${dmSans.className}`}>Job Reference:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{data.workOrderSection.jobReference}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {data.workOrderSection?.clientPONumber && (
                  <div>
                    <p className={`text-xl font-bold text-gray-600 tracking-wide ${dmSans.className}`}>PO Number:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{data.workOrderSection.clientPONumber}</p>
                  </div>
                )}
                {data.workOrderSection?.deliveryDate && (
                  <div>
                    <p className={`text-xl font-bold text-gray-600 tracking-wide ${dmSans.className}`}>Delivery Date:</p>
                    <p className={`text-lg tracking-wide ${dmSans.className}`}>{formatDate(data.workOrderSection.deliveryDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Documents Section */}
        {data.salesOrderSection?.requiredDocuments && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] mb-4 border-b pb-2 ${dmSans.className}`}>
              Required Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.salesOrderSection.requiredDocuments.approvedShopDrawingUrl && (
                <div>
                  <h3 className={`text-lg font-medium text-[#8B5E3C] mb-3 tracking-wide ${dmSans.className}`}>
                    Approved Shop Drawing
                  </h3>
                  <a
                    href={data.salesOrderSection.requiredDocuments.approvedShopDrawingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-blue-600 hover:underline flex items-center tracking-wide ${dmSans.className}`}
                  >
                    📄 {data.salesOrderSection.requiredDocuments.approvedShopDrawingName || "View Document"}
                  </a>
                </div>
              )}
              {data.salesOrderSection.requiredDocuments.componentListUrl && (
                <div>
                  <h3 className={`text-lg font-medium text-[#8B5E3C] mb-3 tracking-wide ${dmSans.className}`}>
                    Component List
                  </h3>
                  <a
                    href={data.salesOrderSection.requiredDocuments.componentListUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-blue-600 hover:underline flex items-center tracking-wide ${dmSans.className}`}
                  >
                    📄 {data.salesOrderSection.requiredDocuments.componentListName || "View Document"}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ Products Table */}
        {data.workOrderSection?.products && data.workOrderSection.products.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <h2 className={`text-2xl font-semibold tracking-wide text-[#8B5E3C] p-6 pb-4 ${dmSans.className}`}>
              Products
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={`px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider ${dmSans.className}`}>
                      S No.
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider ${dmSans.className}`}>
                      Serial Number
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider ${dmSans.className}`}>
                      Description
                    </th>
                    <th className={`px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase tracking-wider ${dmSans.className}`}>
                      Qty
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider ${dmSans.className}`}>
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.workOrderSection.products.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className={`px-6 py-4 tracking-wide ${dmSans.className}`}>{index + 1}.</td>
                      <td className={`px-6 py-4 text-gray-500 tracking-wide ${dmSans.className}`}>
                        {product.serialNumber || "-"}
                      </td>
                      <td className={`px-6 py-4 tracking-wide ${dmSans.className}`}>
                        {product.itemDescription || "-"}
                      </td>
                      <td className={`px-6 py-4 text-right tracking-wide ${dmSans.className}`}>
                        {product.quantity || 0}
                      </td>
                      <td className={`px-6 py-4 tracking-wide ${dmSans.className}`}>
                        {product.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className={`px-6 py-3 text-right text-sm font-medium text-gray-500 tracking-wider ${dmSans.className}`}>
                      Total Items:
                    </td>
                    <td className={`px-6 py-3 text-right text-sm font-medium tracking-wider ${dmSans.className}`}>
                      {data.workOrderSection.products.length}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td colSpan={3} className={`px-6 py-3 text-right text-sm font-bold text-gray-900 tracking-wider ${dmSans.className}`}>
                      Total Quantity:
                    </td>
                    <td className={`px-6 py-3 text-right text-sm font-bold text-[#8B5E3C] tracking-wider ${dmSans.className}`}>
                      {data.workOrderSection.products.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}