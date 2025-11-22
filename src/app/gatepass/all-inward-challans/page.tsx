'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';


interface InwardItem {
  serialNumber: number;
  description: string;
  width: number;
  length: number;
  qty: number; // This is the Product Quantity from Sanity
  receivedQty: number;
  remainingQty: number;
  sqft: number;
  ratePerSqft: number;
  rate: number;
  amount: number;
}

interface InwardChallan {
  _id: string;
  autoChallanNumber: string;
  outwardChallanNumber: string;
  date: string;
  time: string;
  workOrderNumber: string;
  paintColor: string;
  items: InwardItem[];
  totalPieces: number;
  totalReceivedPieces: number;
  totalRemainingPieces: number;
  totalAmount: number;
  summary?: string;
  _createdAt: string;
}

export default function InwardChallanPage() {
  const [challans, setChallans] = useState<InwardChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      const response = await fetch('/api/inward-challan');
      const result = await response.json();
      
      if (result.success) {
        setChallans(result.data);
      }
    } catch (error) {
      console.error('Error fetching challans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChallans = challans.filter(challan =>
    challan.autoChallanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challan.outwardChallanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challan.workOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challan.paintColor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Safe number formatting function
  const formatAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'Rs. 0.00';
    }
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Safe number display for pieces
  const formatPieces = (pieces: number | null | undefined) => {
    if (pieces === null || pieces === undefined || isNaN(pieces)) {
      return 0;
    }
    return pieces;
  };

  // Calculate totals for summary cards
  const totals = {
    totalChallans: challans.length,
    totalPieces: challans.reduce((sum, challan) => sum + formatPieces(challan.totalPieces), 0),
    totalReceivedPieces: challans.reduce((sum, challan) => sum + formatPieces(challan.totalReceivedPieces), 0),
    totalRemainingPieces: challans.reduce((sum, challan) => sum + formatPieces(challan.totalRemainingPieces), 0),
    totalAmount: challans.reduce((sum, challan) => {
      const amount = challan.totalAmount || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0)
  };

  // Print function for individual challan
  const handlePrintChallan = (challan: InwardChallan) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      
      // Calculate item-level totals from Sanity schema fields
      // const totalSqft = challan.items?.reduce((sum, item) => sum + (item.sqft || 0), 0) || 0;
      // const totalProductQty = challan.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0; // Using qty from Sanity
      // const totalReceivedQty = challan.items?.reduce((sum, item) => sum + (item.receivedQty || 0), 0) || 0;
      // const totalRemainingQty = challan.items?.reduce((sum, item) => sum + (item.remainingQty || 0), 0) || 0;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Inward Challan - ${challan.autoChallanNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
              
              * {
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              
              body { 
                margin: 0; 
                padding: 8px; 
                color: #000;
                background: white;
                font-size: 12px;
                line-height: 1.2;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .print-container { 
                max-width: 1100px; 
                margin: 0 auto;
                border: 1px solid #000;
                padding: 0;
                position: relative;
                min-height: 95vh;
                display: flex;
                flex-direction: column;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              
              /* Header Section Styling - Reduced top space */
              .header-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 5px 15px 10px 15px;
                border-bottom: 2px solid #000;
                background: #fff;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .logo-section {
                flex: 1;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
                margin-top: -3px;
              }
              .logo-container {
                position: relative;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .logo-placeholder {
                width: 250px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                color: #000;
                background: #fff;
                font-weight: 600;
                text-transform: uppercase;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .logo-img {
                width: 250px;
                height: 100px;
                object-fit: contain;
              }
              .title-section {
                flex: 2;
                text-align: right;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
                margin-top: -3px;
              }
              .main-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 2px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                font-family: 'DM Sans', sans-serif !important;
              }
              .challan-type {
                font-size: 16px;
                font-weight: bold;
                margin-top: 3px;
                padding: 4px 12px;
                border: 2px solid #000;
                display: inline-block;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                font-family: 'DM Sans', sans-serif !important;
              }
              
              /* Info Section Styling */
              .info-section {
                padding: 8px 15px;
                border-bottom: 1px solid #000;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .info-table {
                width: 100%;
                border-collapse: collapse;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .info-table td {
                padding: 3px 8px;
                vertical-align: top;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .info-label {
                font-weight: bold;
                white-space: nowrap;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              
              /* Table Styling - More compact */
              .table-section {
                padding: 0;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
                flex: 1;
              }
              .data-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #000;
                font-size: 10px;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .data-table th {
                background: #f0f0f0;
                padding: 6px 4px;
                text-align: center;
                font-weight: bold;
                border: 1px solid #000;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .data-table td {
                padding: 4px 4px;
                border: 1px solid #000;
                vertical-align: top;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .sno-column { width: 40px; }
              .description-column { width: 200px; }
              .size-column { width: 60px; }
              .qty-column { width: 50px; }
              .numeric-column { width: 70px; text-align: right; }
              .center-cell {
                text-align: center;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .numeric-cell {
                text-align: right;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              
              /* Summary rows styling */
              .summary-total {
                font-weight: bold;
                border-top: 2px solid #000;
                background: #f5f5f5;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .total-row {
                background: #e8f5e8 !important;
                font-weight: bold;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              
              /* Signature Section Styling - Increased bottom margin and padding */
              .signature-section {
                padding: 20px 15px 15px 15px;
                margin-top: auto;
                margin-bottom: 20px;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .signature-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 20px;
                margin-top: 10px;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .signature-line {
                border-top: 1px solid #000;
                margin-top: 25px;
                padding-top: 5px;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              .signature-label {
                font-weight: bold;
                text-align: center;
                font-size: 11px;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }

              /* Date and Time Footer - Left aligned */
              .datetime-footer {
                text-align: left;
                padding: 8px 15px;
                border-top: 1px solid #000;
                background: #f9f9f9;
                font-size: 11px;
                font-weight: bold;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
                margin-top: auto;
              }
              
              /* Content wrapper */
              .content-wrapper {
                display: flex;
                flex-direction: column;
                flex: 1;
                font-family: 'DM Sans', sans-serif !important;
                letter-spacing: 0.05em;
              }
              
              @media print {
                body { 
                  margin: 0; 
                  padding: 3px; 
                  font-family: 'DM Sans', sans-serif !important;
                  letter-spacing: 0.05em;
                }
                .print-container { 
                  border: none; 
                  box-shadow: none; 
                  font-family: 'DM Sans', sans-serif !important;
                  letter-spacing: 0.05em;
                  min-height: 95vh;
                }
                .no-print { display: none !important; }
                .signature-section {
                  position: relative;
                  bottom: auto;
                  margin-bottom: 15px;
                  padding-bottom: 15px;
                }
                .datetime-footer {
                  position: relative;
                  bottom: auto;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <!-- Header Section with Logo and Title - Moved up -->
              <div class="header-section">
                <div class="logo-section">
                  <div class="logo-container">
                    <div class="logo-placeholder">
                      <img src="/logo.png" alt="Company Logo" class="logo-img" onerror="this.style.display='none'; this.parentNode.innerHTML='COMPANY LOGO';">
                    </div>
                  </div>
                </div>
                <div class="title-section">
                  <div class="main-title">INWARD CHALLAN</div>
                  <div class="challan-type">
                    GATE PASS
                  </div>
                </div>
              </div>

              <div class="content-wrapper">
                <!-- Basic Information -->
                <div class="info-section">
                  <table class="info-table">
                    <tbody>
                      <tr>
                        <td>M/S Qadri Spray Tech</td>
                        <td></td>
                        <td class="info-label">Inward Challan No:</td>            
                        <td>${challan.autoChallanNumber}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td class="info-label">Outward Challan No:</td>
                        <td>${challan.outwardChallanNumber}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td class="info-label">Date:</td>
                        <td>${challan.date} | ${challan.time}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td class="info-label">Work Order No#:</td>
                        <td>${challan.workOrderNumber}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td class="info-label">Paint Color:</td>
                        <td>${challan.paintColor || "RAL 7035"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Inward Items Section -->
                <div class="table-section">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th class="sno-column">S.No</th>
                        <th class="description-column">Description</th>
                        <th class="size-column">Width (mm)</th>
                        <th class="size-column">Length (mm)</th>
                        <th class="numeric-column">SQFT</th>
                        <th class="qty-column">Qty</th>
                        <th class="qty-column">Received</th>
                        <th class="qty-column">Remaining</th>
                        <th class="numeric-column">Rate</th>
                        <th class="numeric-column">Rate/SQFT</th>
                        <th class="numeric-column">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${challan.items?.length > 0 ? 
                        challan.items.map((item, index) => `
                          <tr>
                            <td class="center-cell">${item.serialNumber || index + 1}</td>
                            <td>${item.description || "-"}</td>
                            <td class="numeric-cell">${(item.width || 0).toFixed(2)}</td>
                            <td class="numeric-cell">${(item.length || 0).toFixed(2)}</td>
                            <td class="numeric-cell">${(item.sqft || 0).toFixed(2)}</td>
                            <td class="center-cell">${item.qty || 0}</td>
                            <td class="center-cell" style="font-weight: bold;">${item.receivedQty || 0}</td>
                            <td class="center-cell" style="font-weight: bold;">${item.remainingQty || 0}</td>
                            <td class="numeric-cell">${(item.rate || 0).toFixed(2)}</td>
                            <td class="numeric-cell">${(item.ratePerSqft || 0).toFixed(2)}</td>
                            <td class="numeric-cell">${(item.amount || 0).toFixed(2)}</td>
                          </tr>
                        `).join('') : 
                        `<tr>
                          <td colspan="11" class="center-cell" style="padding: 10px;">
                            No items found
                          </td>
                        </tr>`
                      }
                    </tbody>
                    ${challan.items?.length > 0 ? `
                      <tfoot>
                        <tr class="total-row">
                          <td colspan="10" style="text-align: right; font-weight: bold;">Total Amount:</td>
                          <td class="numeric-cell" style="font-weight: bold; font-size: 11px;">${(challan.totalAmount || 0).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    ` : ''}
                  </table>
                </div>

                <!-- Signature Section - Increased bottom space -->
                <div class="signature-section">
                  <div class="signature-grid">
                    <div>
                      <div class="signature-line"></div>
                      <div class="signature-label">Store Dept.</div>
                    </div>
                    <div>
                      <div class="signature-line"></div>
                      <div class="signature-label">Mechanical Dept.</div>
                    </div>
                    <div>
                      <div class="signature-line"></div>
                      <div class="signature-label">Received By.</div>
                    </div>
                  </div>
                </div>

                <!-- Date and Time Footer - Left aligned -->
                <div class="datetime-footer">
                  Printed on: ${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }
  };

  // Download as PDF function
  const handleDownloadPDF = (challan: InwardChallan) => {
    // For now, we'll trigger print which allows saving as PDF
    // In a real implementation, you would use a PDF generation library
    handlePrintChallan(challan);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg font-dm-sans tracking-wide">Loading inward challans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 font-dm-sans tracking-wide">Inward Challans</h1>
        <Link
          href="/inward-challan/new"
          className="bg-[#8B5E3C] text-white px-6 py-2 rounded-md hover:bg-[#7A4F32] transition-colors font-medium flex items-center gap-2 font-dm-sans tracking-wide"
        >
          <span>➕</span>
          Create New Challan
        </Link>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Challan No, Outward Challan, Work Order, or Paint Color..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-transparent font-dm-sans tracking-wide"
        />
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 font-dm-sans tracking-wide">
          <h3 className="font-semibold text-gray-700 mb-2">Total Challans</h3>
          <p className="text-2xl font-bold text-[#8B5E3C]">{totals.totalChallans}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 font-dm-sans tracking-wide">
          <h3 className="font-semibold text-gray-700 mb-2">Total Pieces</h3>
          <p className="text-2xl font-bold text-[#8B5E3C]">{totals.totalPieces}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 font-dm-sans tracking-wide">
          <h3 className="font-semibold text-gray-700 mb-2">Received Pieces</h3>
          <p className="text-2xl font-bold text-green-600">{totals.totalReceivedPieces}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 font-dm-sans tracking-wide">
          <h3 className="font-semibold text-gray-700 mb-2">Total Amount</h3>
          <p className="text-2xl font-bold text-[#8B5E3C]">{formatAmount(totals.totalAmount)}</p>
        </div>
      </div>

      {/* Challans List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 font-dm-sans tracking-wide">
        {filteredChallans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {challans.length === 0 
              ? "No inward challans found."
              : "No challans match your search."
            }
            {challans.length === 0 && (
              <Link href="/inward-challan/new" className="text-[#8B5E3C] hover:underline ml-1 font-dm-sans tracking-wide">
                Create one now
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Inward Challan No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Outward Challan No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Work Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Paint Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Total Pieces
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Received Pieces
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Remaining Pieces
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-dm-sans">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChallans.map((challan) => (
                  <tr key={challan._id} className="hover:bg-gray-50 font-dm-sans tracking-wide">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {challan.autoChallanNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challan.outwardChallanNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challan.workOrderNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(challan.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challan.paintColor || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPieces(challan.totalPieces)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {formatPieces(challan.totalReceivedPieces)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {formatPieces(challan.totalRemainingPieces)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(challan.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {/* View Icon */}
                        <Link
                          href={`/inward-challan/${challan._id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded font-dm-sans tracking-wide"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        
                        {/* Print Icon */}
                        <button
                          onClick={() => handlePrintChallan(challan)}
                          className="text-green-600 hover:text-green-800 transition-colors p-1 rounded font-dm-sans tracking-wide"
                          title="Print Challan"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </button>
                        
                        {/* Download Icon */}
                        <button
                          onClick={() => handleDownloadPDF(challan)}
                          className="text-purple-600 hover:text-purple-800 transition-colors p-1 rounded font-dm-sans tracking-wide"
                          title="Download as PDF"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}