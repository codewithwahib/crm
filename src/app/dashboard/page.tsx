// // 'use client'
// // import { useState, useEffect } from 'react'
// // import { client } from '@/sanity/lib/client'
// // import { useAuth } from "@/hooks/useAuth"; // ✅ ADD THIS
// // import { DM_Sans } from 'next/font/google'
// // import Sidebar from '@/app/Components/sidebar'
// // import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// // const dmSans = DM_Sans({
// //   subsets: ['latin'],
// //   weight: ['400', '500', '700'],
// //   variable: '--font-dm-sans',
// // })

// // interface Quotation {
// //   quotationId: string
// //   client: string
// //   date: string
// //   status: string
// //   amountWithoutGST: number
// //   gst: number
// //   amountWithGST: number
// // }

// // interface WorkOrder {
// //   _id: string
// //   _createdAt: string
// //   salesOrderSection: {
// //     orderDetails: {
// //       poValue: number
// //     }
// //     termsAndConditions: {
// //       pricesIncludeGST: boolean
// //     }
// //   }
// // }

// // const STATUS_COLORS = {
// //   Draft: '#FBBF24',
// //   Sent: '#60A5FA',
// //   Accepted: '#34D399',
// //   Rejected: '#F87171',
// //   Expired: '#9CA3AF'
// // };

// // export default function CombinedDashboard() {
// //   const [activeTab, setActiveTab] = useState<'quotations' | 'workorders'>('quotations')
// //   const [quotations, setQuotations] = useState<Quotation[]>([])
// //   const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
// //   const [isLoading, setIsLoading] = useState(true)
// //   const [error, setError] = useState<string | null>(null)
// //   const [statusFilter, setStatusFilter] = useState<string>('all')
// //   const [dateRangeFilter, setDateRangeFilter] = useState<string>('all')
// //   const [isMobile, setIsMobile] = useState(false)

// //   useEffect(() => {
// //     const handleResize = () => {
// //       setIsMobile(window.innerWidth < 768)
// //     }

// //     handleResize()
// //     window.addEventListener('resize', handleResize)
// //     return () => window.removeEventListener('resize', handleResize)
// //   }, [])

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         setIsLoading(true)
// //         setError(null)
        
// //         if (activeTab === 'quotations') {
// //           const query = `*[_type == "quotation"]{
// //             quotationId,
// //             client,
// //             date,
// //             status,
// //             "amountWithoutGST": subtotal,
// //             gst,
// //             "amountWithGST": totalPrice
// //           } | order(date desc)`
          
// //           const result = await client.fetch<Quotation[]>(query)
// //           setQuotations(result)
// //         } else {
// //           const query = `*[_type == "workOrderSalesOrder"]{
// //             _id,
// //             _createdAt,
// //             salesOrderSection{
// //               orderDetails{
// //                 poValue
// //               },
// //               termsAndConditions{
// //                 pricesIncludeGST
// //               }
// //             }
// //           }`
          
// //           const result = await client.fetch<WorkOrder[]>(query)
// //           setWorkOrders(result)
// //         }
// //       } catch (err) {
// //         console.error(`Failed to fetch ${activeTab}`, err)
// //         setError(`Failed to load ${activeTab}`)
// //       } finally {
// //         setIsLoading(false)
// //       }
// //     }

// //     fetchData()
// //   }, [activeTab])

// //   // Filter quotations based on selected filters
// //   const filteredQuotations = quotations.filter(quotation => {
// //     // Status filter
// //     const statusMatch = statusFilter === 'all' || quotation.status === statusFilter
    
// //     // Date range filter
// //     let dateMatch = true
// //     if (dateRangeFilter !== 'all') {
// //       const now = new Date()
// //       const quoteDate = new Date(quotation.date)
      
// //       switch(dateRangeFilter) {
// //         case 'today':
// //           dateMatch = quoteDate.toDateString() === now.toDateString()
// //           break
// //         case 'week':
// //           const weekStart = new Date(now)
// //           weekStart.setDate(now.getDate() - now.getDay())
// //           weekStart.setHours(0, 0, 0, 0)
// //           dateMatch = quoteDate >= weekStart
// //           break
// //         case 'month':
// //           const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
// //           dateMatch = quoteDate >= monthStart
// //           break
// //         case 'year':
// //           const yearStart = new Date(now.getFullYear(), 0, 1)
// //           dateMatch = quoteDate >= yearStart
// //           break
// //       }
// //     }
    
// //     return statusMatch && dateMatch
// //   })

// //   const displayQuotations = filteredQuotations
// //   const displayWorkOrders = workOrders

// //   // Quotation calculations
// //   const totalQuotations = displayQuotations.length
// //   const totalQuotationAmountWithoutGST = displayQuotations.reduce((sum, q) => sum + (q.amountWithoutGST || 0), 0)
// //   const totalQuotationGST = displayQuotations.reduce((sum, q) => sum + (q.gst || 0), 0)
// //   const totalQuotationAmountWithGST = displayQuotations.reduce((sum, q) => sum + (q.amountWithGST || 0), 0)

// //   // Work Order calculations
// //   const totalWorkOrders = displayWorkOrders.length
// //   const totalWorkOrderAmountWithGST = displayWorkOrders.reduce((sum, wo) => sum + (wo.salesOrderSection?.orderDetails?.poValue || 0), 0)
// //   const totalWorkOrderAmountWithoutGST = displayWorkOrders.reduce((sum, wo) => {
// //     const poValue = wo.salesOrderSection?.orderDetails?.poValue || 0
// //     if (wo.salesOrderSection?.termsAndConditions?.pricesIncludeGST) {
// //       return sum + (poValue / 1.17)
// //     }
// //     return sum + poValue
// //   }, 0)
// //   const totalWorkOrderGST = totalWorkOrderAmountWithGST - totalWorkOrderAmountWithoutGST

// //   const formatCurrency = (amount: number) => {
// //     const currencySymbol = activeTab === 'quotations' ? 'INR' : 'PKR'
// //     return new Intl.NumberFormat('en-IN', {
// //       style: 'currency',
// //       currency: currencySymbol,
// //       minimumFractionDigits: 0,
// //       maximumFractionDigits: 0
// //     }).format(amount).replace(currencySymbol === 'INR' ? '₹' : 'PKR', 'Rs ')
// //   }

// //   // Prepare data for charts
// //   const prepareQuotationStatusData = () => {
// //     const statusCounts = displayQuotations.reduce((acc, q) => {
// //       acc[q.status] = (acc[q.status] || 0) + 1
// //       return acc
// //     }, {} as Record<string, number>)

// //     return Object.entries(statusCounts).map(([name, value]) => ({
// //       name,
// //       value,
// //       color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#888'
// //     }))
// //   }

// //   const prepareMonthlyQuotationData = () => {
// //     const monthlyData = displayQuotations.reduce((acc, q) => {
// //       const date = new Date(q.date)
// //       const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      
// //       if (!acc[monthYear]) {
// //         acc[monthYear] = {
// //           month: monthYear,
// //           amount: 0,
// //           count: 0
// //         }
// //       }
      
// //       acc[monthYear].amount += q.amountWithGST || 0
// //       acc[monthYear].count += 1
// //       return acc
// //     }, {} as Record<string, { month: string; amount: number; count: number }>)

// //     return Object.values(monthlyData)
// //       .sort((a, b) => a.month.localeCompare(b.month))
// //       .slice(-6)
// //   }

// //   const prepareWorkOrderTimelineData = () => {
// //     const monthlyData = displayWorkOrders.reduce((acc, wo) => {
// //       const date = new Date(wo._createdAt)
// //       const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      
// //       if (!acc[monthYear]) {
// //         acc[monthYear] = {
// //           month: monthYear,
// //           amount: 0,
// //           count: 0
// //         }
// //       }
      
// //       const poValue = wo.salesOrderSection?.orderDetails?.poValue || 0
// //       acc[monthYear].amount += poValue
// //       acc[monthYear].count += 1
// //       return acc
// //     }, {} as Record<string, { month: string; amount: number; count: number }>)

// //     return Object.values(monthlyData)
// //       .sort((a, b) => a.month.localeCompare(b.month))
// //       .slice(-6)
// //   }

// //   const quotationStatusData = prepareQuotationStatusData()
// //   const monthlyQuotationData = prepareMonthlyQuotationData()
// //   const workOrderTimelineData = prepareWorkOrderTimelineData()

// //   const statusOptions = ['all', ...Array.from(new Set(quotations.map(q => q.status)))]

// //   if (isLoading) {
// //     return (
// //       <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
// //         <Sidebar />
// //         <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
// //           <div className="flex justify-center items-center py-20">
// //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div>
// //           </div>
// //         </main>
// //       </div>
// //     )
// //   }

// //   if (error) {
// //     return (
// //       <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
// //         <Sidebar />
// //         <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
// //           <div className="bg-red-100 text-red-700 p-4 rounded-md">
// //             <p className="font-medium">{error}</p>
// //           </div>
// //         </main>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
// //       <Sidebar />
// //       <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
// //         {/* Header Section */}
// //         <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 gap-4">
// //           <div className="space-y-2 pt-10 pl-5 w-full md:w-auto">
// //             <h1 className={`text-2xl sm:text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
// //               {activeTab === 'quotations' ? 'Quotation Dashboard' : 'Work Order Dashboard'}
// //             </h1>
// //             <p className={`text-gray-600 text-sm sm:text-base ${dmSans.className}`}>
// //               {activeTab === 'quotations' ? 'Overview of all quotations' : 'Overview of all work orders'}
// //             </p>
// //           </div>
// //           <div className="flex space-x-2 w-full md:w-auto pb-4 md:pb-0 pl-5 md:pl-0">
// //             <button
// //               onClick={() => setActiveTab('quotations')}
// //               className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base ${
// //                 activeTab === 'quotations' 
// //                   ? 'bg-[#8B5E3C] text-white' 
// //                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
// //               }`}
// //             >
// //               Quotations
// //             </button>
// //             <button
// //               onClick={() => setActiveTab('workorders')}
// //               className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base ${
// //                 activeTab === 'workorders' 
// //                   ? 'bg-[#8B5E3C] text-white' 
// //                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
// //               }`}
// //             >
// //               Work Orders
// //             </button>
// //           </div>
// //         </div>

// //         {activeTab === 'quotations' ? (
// //           <>
// //             {/* Filter Section */}
// //            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //   {/* Status Filter */}
// //   <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
// //     <h2
// //       className={`text-base sm:text-lg md:text-xl font-semibold text-[#8B5E3C] mb-3 sm:mb-4 pb-2 border-b ${dmSans.className}`}
// //     >
// //       Filter Options
// //     </h2>
// //     <div className="space-y-3">
// //       <div>
// //         <label
// //           htmlFor="statusFilter"
// //           className={`block text-sm sm:text-base font-medium text-gray-600 ${dmSans.className}`}
// //         >
// //           Status
// //         </label>
// //         <div className="relative w-full">
// //           <select
// //             id="statusFilter"
// //             className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#8B5E3C] focus:ring-[#8B5E3C] 
// //               p-2 sm:p-3 text-sm sm:text-base md:text-lg appearance-none pr-10 ${dmSans.className}`}
// //             value={statusFilter}
// //             onChange={(e) => setStatusFilter(e.target.value)}
// //           >
// //             {statusOptions.map((status) => (
// //               <option
// //                 key={status}
// //                 value={status}
// //                 className={`text-sm sm:text-base md:text-lg ${dmSans.className}`}
// //               >
// //                 {status === 'all' ? 'All Statuses' : status}
// //               </option>
// //             ))}
// //           </select>
// //           {/* ▼ Custom dropdown arrow */}
// //           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
// //             ▼
// //           </span>
// //         </div>
// //       </div>
// //     </div>
// //   </div>

// //   {/* Date Range Filter */}
// //   <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
// //     <h2
// //       className={`text-base sm:text-lg md:text-xl font-semibold text-[#8B5E3C] mb-3 sm:mb-4 pb-2 border-b ${dmSans.className}`}
// //     >
// //       Date Range
// //     </h2>
// //     <div className="space-y-3">
// //       <div>
// //         <label
// //           htmlFor="dateRangeFilter"
// //           className={`block text-sm sm:text-base font-medium text-gray-600 ${dmSans.className}`}
// //         >
// //           Time Period
// //         </label>
// //         <div className="relative w-full">
// //           <select
// //             id="dateRangeFilter"
// //             className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#8B5E3C] focus:ring-[#8B5E3C] 
// //               p-2 sm:p-3 text-sm sm:text-base md:text-lg appearance-none pr-10 ${dmSans.className}`}
// //             value={dateRangeFilter}
// //             onChange={(e) => setDateRangeFilter(e.target.value)}
// //           >
// //             <option value="all">All Time</option>
// //             <option value="today">Today</option>
// //             <option value="week">This Week</option>
// //             <option value="month">This Month</option>
// //             <option value="year">This Year</option>
// //           </select>
// //           {/* ▼ Custom dropdown arrow */}
// //           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
// //             ▼
// //           </span>
// //         </div>
// //       </div>
// //     </div>
// //   </div>
// // </div>


// //             {/* Quotation Summary Cards */}
// //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
// //               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total Quotations</h3>
// //                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
// //                   {totalQuotations}
// //                 </p>
// //               </div>

// //               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (excl. GST)</h3>
// //                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
// //                   {formatCurrency(totalQuotationAmountWithoutGST)}
// //                 </p>
// //               </div>

// //               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total GST</h3>
// //                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
// //                   {formatCurrency(totalQuotationGST)}
// //                 </p>
// //               </div>

// //               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (incl. GST)</h3>
// //                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
// //                   {formatCurrency(totalQuotationAmountWithGST)}
// //                 </p>
// //               </div>
// //             </div>

// //             {/* Quotation Charts Section */}
// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
// //               {/* Status Breakdown Pie Chart */}
// //               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //                 <h2 className={`text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 ${dmSans.className}`}>
// //                   Quotation Status Distribution
// //                 </h2>
// //               <div className="h-64">
// //   <ResponsiveContainer width="100%" height="100%">
// //     <PieChart>
// //       <Pie
// //         data={Array.isArray(quotationStatusData) ? quotationStatusData : []}
// //         cx="50%"
// //         cy="50%"
// //         labelLine={false}
// //         outerRadius={isMobile ? 70 : 80}
// //         fill="#8884d8"
// //         dataKey="value"
// //         label={({ name, percent }) => {
// //           const safePercent = percent ? (percent * 100).toFixed(0) : 0;
// //           return `${name || 'Unknown'}: ${safePercent}%`;
// //         }}
// //       >
// //         {(quotationStatusData || []).map((entry, index) => (
// //           <Cell key={`cell-${index}`} fill={entry?.color || '#ccc'} />
// //         ))}
// //       </Pie>
// //       <Tooltip formatter={(value: number) => [`${value ?? 0} quotations`, 'Count']} />
// //       <Legend />
// //     </PieChart>
// //   </ResponsiveContainer>
// // </div>

// //               </div>

// //               {/* Monthly Trend Bar Chart */}
// //               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //                 <h2 className={`text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 ${dmSans.className}`}>
// //                   Monthly Quotation Value Trend
// //                 </h2>
// //                 <div className="h-64">
// //                   <ResponsiveContainer width="100%" height="100%">
// //                     <BarChart data={monthlyQuotationData}>
// //                       <CartesianGrid strokeDasharray="3 3" />
// //                       <XAxis dataKey="month" />
// //                       <YAxis 
// //                         tickFormatter={(value) => formatCurrency(value).replace('Rs ', '')}
// //                         width={isMobile ? 60 : 80}
// //                       />
// //                       <Tooltip 
// //                         formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
// //                         labelFormatter={(label) => `Month: ${label}`}
// //                       />
// //                       <Legend />
// //                       <Bar dataKey="amount" name="Total Value" fill="#FF8C00" />
// //                     </BarChart>
// //                   </ResponsiveContainer>
// //                 </div>
// //               </div>
// //             </div>
// //           </>
// //         ) : (
// //           <>
// //             {/* Work Order Summary Cards */}
// //             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
// //               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total Work Orders</h3>
// //                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
// //                   {totalWorkOrders}
// //                 </p>
// //               </div>

// //               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (excl. GST)</h3>
// //                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
// //                   {formatCurrency(totalWorkOrderAmountWithoutGST)}
// //                 </p>
// //               </div>

// //               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (incl. GST)</h3>
// //                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
// //                   {formatCurrency(totalWorkOrderAmountWithGST)}
// //                 </p>
// //               </div>
// //             </div>

// //             {/* Work Order GST Summary */}
// //             <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //               <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total GST</h3>
// //               <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
// //                 {formatCurrency(totalWorkOrderGST)}
// //               </p>
// //             </div>

// //             {/* Work Order Charts Section */}
// //             <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
// //               <h2 className={`text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 ${dmSans.className}`}>
// //                 Work Order Value Trend (Last 6 Months)
// //               </h2>
// //               <div className="h-64">
// //                 <ResponsiveContainer width="100%" height="100%">
// //                   <BarChart data={workOrderTimelineData}>
// //                     <CartesianGrid strokeDasharray="3 3" />
// //                     <XAxis dataKey="month" />
// //                     <YAxis 
// //                       tickFormatter={(value) => formatCurrency(value).replace('Rs ', '')}
// //                       width={isMobile ? 60 : 80}
// //                     />
// //                     <Tooltip 
// //                       formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
// //                       labelFormatter={(label) => `Month: ${label}`}
// //                     />
// //                     <Legend />
// //                     <Bar dataKey="amount" name="Total Value" fill="#FF8C00" />
// //                   </BarChart>
// //                 </ResponsiveContainer>
// //               </div>
// //             </div>
// //           </>
// //         )}
// //       </main>
// //     </div>
// //   )
// // }

// // export const dynamic = 'force-dynamic'







// 'use client'
// import { useState, useEffect } from 'react'
// import { client } from '@/sanity/lib/client'
// import { DM_Sans } from 'next/font/google'
// import Sidebar from '@/app/Components/sidebar'import ProtectedLayout from '@/app/Components/ProtectedProvider'  // ✅ ADD THIS

// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
// // 
// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-dm-sans',
// })

// interface Quotation {
//   quotationId: string
//   client: string
//   date: string
//   status: string
//   amountWithoutGST: number
//   gst: number
//   amountWithGST: number
// }

// interface WorkOrder {
//   _id: string
//   _createdAt: string
//   salesOrderSection: {
//     orderDetails: {
//       poValue: number
//     }
//     termsAndConditions: {
//       pricesIncludeGST: boolean
//     }
//   }
// }

// const STATUS_COLORS = {
//   Draft: '#FBBF24',
//   Sent: '#60A5FA',
//   Accepted: '#34D399',
//   Rejected: '#F87171',
//   Expired: '#9CA3AF'
// };

// export default function CombinedDashboard() {
//   const [activeTab, setActiveTab] = useState<'quotations' | 'workorders'>('quotations')
//   const [quotations, setQuotations] = useState<Quotation[]>([])
//   const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [statusFilter, setStatusFilter] = useState<string>('all')
//   const [dateRangeFilter, setDateRangeFilter] = useState<string>('all')
//   const [isMobile, setIsMobile] = useState(false)

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768)
//     }
//     handleResize()
//     window.addEventListener('resize', handleResize)
//     return () => window.removeEventListener('resize', handleResize)
//   }, [])

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true)
//         setError(null)
        
//         if (activeTab === 'quotations') {
//           const query = `*[_type == "quotation"]{
//             quotationId,
//             client,
//             date,
//             status,
//             "amountWithoutGST": subtotal,
//             gst,
//             "amountWithGST": totalPrice
//           } | order(date desc)`
          
//           const result = await client.fetch<Quotation[]>(query)
//           setQuotations(result)
//         } else {
//           const query = `*[_type == "workOrderSalesOrder"]{
//             _id,
//             _createdAt,
//             salesOrderSection{
//               orderDetails{
//                 poValue
//               },
//               termsAndConditions{
//                 pricesIncludeGST
//               }
//             }
//           }`
          
//           const result = await client.fetch<WorkOrder[]>(query)
//           setWorkOrders(result)
//         }
//       } catch (err) {
//         console.error(`Failed to fetch ${activeTab}`, err)
//         setError(`Failed to load ${activeTab}`)
//       } finally {
//         setIsLoading(false)
//       }
//     }
//     fetchData()
//   }, [activeTab])

//   const filteredQuotations = quotations.filter(quotation => {
//     const statusMatch = statusFilter === 'all' || quotation.status === statusFilter
    
//     let dateMatch = true
//     if (dateRangeFilter !== 'all') {
//       const now = new Date()
//       const quoteDate = new Date(quotation.date)
      
//       switch(dateRangeFilter) {
//         case 'today':
//           dateMatch = quoteDate.toDateString() === now.toDateString()
//           break
//         case 'week':
//           const weekStart = new Date(now)
//           weekStart.setDate(now.getDate() - now.getDay())
//           weekStart.setHours(0, 0, 0, 0)
//           dateMatch = quoteDate >= weekStart
//           break
//         case 'month':
//           const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
//           dateMatch = quoteDate >= monthStart
//           break
//         case 'year':
//           const yearStart = new Date(now.getFullYear(), 0, 1)
//           dateMatch = quoteDate >= yearStart
//           break
//       }
//     }
    
//     return statusMatch && dateMatch
//   })

//   const displayQuotations = filteredQuotations
//   const displayWorkOrders = workOrders

//   const totalQuotations = displayQuotations.length
//   const totalQuotationAmountWithoutGST = displayQuotations.reduce((sum, q) => sum + (q.amountWithoutGST || 0), 0)
//   const totalQuotationGST = displayQuotations.reduce((sum, q) => sum + (q.gst || 0), 0)
//   const totalQuotationAmountWithGST = displayQuotations.reduce((sum, q) => sum + (q.amountWithGST || 0), 0)

//   const totalWorkOrders = displayWorkOrders.length
//   const totalWorkOrderAmountWithGST = displayWorkOrders.reduce((sum, wo) => sum + (wo.salesOrderSection?.orderDetails?.poValue || 0), 0)
//   const totalWorkOrderAmountWithoutGST = displayWorkOrders.reduce((sum, wo) => {
//     const poValue = wo.salesOrderSection?.orderDetails?.poValue || 0
//     if (wo.salesOrderSection?.termsAndConditions?.pricesIncludeGST) {
//       return sum + (poValue / 1.17)
//     }
//     return sum + poValue
//   }, 0)
//   const totalWorkOrderGST = totalWorkOrderAmountWithGST - totalWorkOrderAmountWithoutGST

//   const formatCurrency = (amount: number) => {
//     const currencySymbol = activeTab === 'quotations' ? 'INR' : 'PKR'
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: currencySymbol,
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount).replace(currencySymbol === 'INR' ? '₹' : 'PKR', 'Rs ')
//   }

//   const prepareQuotationStatusData = () => {
//     const statusCounts = displayQuotations.reduce((acc, q) => {
//       acc[q.status] = (acc[q.status] || 0) + 1
//       return acc
//     }, {} as Record<string, number>)

//     return Object.entries(statusCounts).map(([name, value]) => ({
//       name,
//       value,
//       color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#888'
//     }))
//   }

//   const prepareMonthlyQuotationData = () => {
//     const monthlyData = displayQuotations.reduce((acc, q) => {
//       const date = new Date(q.date)
//       const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
//       if (!acc[monthYear]) {
//         acc[monthYear] = { month: monthYear, amount: 0, count: 0 }
//       }
//       acc[monthYear].amount += q.amountWithGST || 0
//       acc[monthYear].count += 1
//       return acc
//     }, {} as Record<string, { month: string; amount: number; count: number }>)

//     return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
//   }

//   const prepareWorkOrderTimelineData = () => {
//     const monthlyData = displayWorkOrders.reduce((acc, wo) => {
//       const date = new Date(wo._createdAt)
//       const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
//       if (!acc[monthYear]) {
//         acc[monthYear] = { month: monthYear, amount: 0, count: 0 }
//       }
//       const poValue = wo.salesOrderSection?.orderDetails?.poValue || 0
//       acc[monthYear].amount += poValue
//       acc[monthYear].count += 1
//       return acc
//     }, {} as Record<string, { month: string; amount: number; count: number }>)

//     return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
//   }

//   const quotationStatusData = prepareQuotationStatusData()
//   const monthlyQuotationData = prepareMonthlyQuotationData()
//   const workOrderTimelineData = prepareWorkOrderTimelineData()
//   const statusOptions = ['all', ...Array.from(new Set(quotations.map(q => q.status)))]

//   if (isLoading) {
//     return (
//       <ProtectedLayout>
//         <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//           <Sidebar />
//           <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
//             <div className="flex justify-center items-center py-20">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div>
//             </div>
//           </main>
//         </div>
//       </ProtectedLayout>
//     )
//   }

//   if (error) {
//     return (
//       <ProtectedLayout>
//         <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//           <Sidebar />
//           <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
//             <div className="bg-red-100 text-red-700 p-4 rounded-md">
//               <p className="font-medium">{error}</p>
//             </div>
//           </main>
//         </div>
//       </ProtectedLayout>
//     )
//   }

//   return (
//     <ProtectedLayout allowedRoles={["owner","gmSales","salesManager"]}> 
//       {/* ✅ Change roles as needed */}
//       <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//       <Sidebar />
//       <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 gap-4">
//           <div className="space-y-2 pt-10 pl-5 w-full md:w-auto">
//             <h1 className={`text-2xl sm:text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
//               {activeTab === 'quotations' ? 'Quotation Dashboard' : 'Work Order Dashboard'}
//             </h1>
//             <p className={`text-gray-600 text-sm sm:text-base ${dmSans.className}`}>
//               {activeTab === 'quotations' ? 'Overview of all quotations' : 'Overview of all work orders'}
//             </p>
//           </div>
//           <div className="flex space-x-2 w-full md:w-auto pb-4 md:pb-0 pl-5 md:pl-0">
//             <button
//               onClick={() => setActiveTab('quotations')}
//               className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base ${
//                 activeTab === 'quotations' 
//                   ? 'bg-[#8B5E3C] text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Quotations
//             </button>
//             <button
//               onClick={() => setActiveTab('workorders')}
//               className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base ${
//                 activeTab === 'workorders' 
//                   ? 'bg-[#8B5E3C] text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Work Orders
//             </button>
//           </div>
//         </div>

//         {activeTab === 'quotations' ? (
//           <>
//             {/* Filter Section */}
//            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//   {/* Status Filter */}
//   <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
//     <h2
//       className={`text-base sm:text-lg md:text-xl font-semibold text-[#8B5E3C] mb-3 sm:mb-4 pb-2 border-b ${dmSans.className}`}
//     >
//       Filter Options
//     </h2>
//     <div className="space-y-3">
//       <div>
//         <label
//           htmlFor="statusFilter"
//           className={`block text-sm sm:text-base font-medium text-gray-600 ${dmSans.className}`}
//         >
//           Status
//         </label>
//         <div className="relative w-full">
//           <select
//             id="statusFilter"
//             className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#8B5E3C] focus:ring-[#8B5E3C] 
//               p-2 sm:p-3 text-sm sm:text-base md:text-lg appearance-none pr-10 ${dmSans.className}`}
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             {statusOptions.map((status) => (
//               <option
//                 key={status}
//                 value={status}
//                 className={`text-sm sm:text-base md:text-lg ${dmSans.className}`}
//               >
//                 {status === 'all' ? 'All Statuses' : status}
//               </option>
//             ))}
//           </select>
//           {/* ▼ Custom dropdown arrow */}
//           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//             ▼
//           </span>
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* Date Range Filter */}
//   <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
//     <h2
//       className={`text-base sm:text-lg md:text-xl font-semibold text-[#8B5E3C] mb-3 sm:mb-4 pb-2 border-b ${dmSans.className}`}
//     >
//       Date Range
//     </h2>
//     <div className="space-y-3">
//       <div>
//         <label
//           htmlFor="dateRangeFilter"
//           className={`block text-sm sm:text-base font-medium text-gray-600 ${dmSans.className}`}
//         >
//           Time Period
//         </label>
//         <div className="relative w-full">
//           <select
//             id="dateRangeFilter"
//             className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#8B5E3C] focus:ring-[#8B5E3C] 
//               p-2 sm:p-3 text-sm sm:text-base md:text-lg appearance-none pr-10 ${dmSans.className}`}
//             value={dateRangeFilter}
//             onChange={(e) => setDateRangeFilter(e.target.value)}
//           >
//             <option value="all">All Time</option>
//             <option value="today">Today</option>
//             <option value="week">This Week</option>
//             <option value="month">This Month</option>
//             <option value="year">This Year</option>
//           </select>
//           {/* ▼ Custom dropdown arrow */}
//           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//             ▼
//           </span>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>


//             {/* Quotation Summary Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total Quotations</h3>
//                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
//                   {totalQuotations}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (excl. GST)</h3>
//                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
//                   {formatCurrency(totalQuotationAmountWithoutGST)}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total GST</h3>
//                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
//                   {formatCurrency(totalQuotationGST)}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (incl. GST)</h3>
//                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
//                   {formatCurrency(totalQuotationAmountWithGST)}
//                 </p>
//               </div>
//             </div>

//             {/* Quotation Charts Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//               {/* Status Breakdown Pie Chart */}
//               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//                 <h2 className={`text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 ${dmSans.className}`}>
//                   Quotation Status Distribution
//                 </h2>
//               <div className="h-64">
//   <ResponsiveContainer width="100%" height="100%">
//     <PieChart>
//       <Pie
//         data={Array.isArray(quotationStatusData) ? quotationStatusData : []}
//         cx="50%"
//         cy="50%"
//         labelLine={false}
//         outerRadius={isMobile ? 70 : 80}
//         fill="#8884d8"
//         dataKey="value"
//         label={({ name, percent }) => {
//           const safePercent = percent ? (percent * 100).toFixed(0) : 0;
//           return `${name || 'Unknown'}: ${safePercent}%`;
//         }}
//       >
//         {(quotationStatusData || []).map((entry, index) => (
//           <Cell key={`cell-${index}`} fill={entry?.color || '#ccc'} />
//         ))}
//       </Pie>
//       <Tooltip formatter={(value: number) => [`${value ?? 0} quotations`, 'Count']} />
//       <Legend />
//     </PieChart>
//   </ResponsiveContainer>
// </div>

//               </div>

//               {/* Monthly Trend Bar Chart */}
//               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//                 <h2 className={`text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 ${dmSans.className}`}>
//                   Monthly Quotation Value Trend
//                 </h2>
//                 <div className="h-64">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={monthlyQuotationData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" />
//                       <YAxis 
//                         tickFormatter={(value) => formatCurrency(value).replace('Rs ', '')}
//                         width={isMobile ? 60 : 80}
//                       />
//                       <Tooltip 
//                         formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
//                         labelFormatter={(label) => `Month: ${label}`}
//                       />
//                       <Legend />
//                       <Bar dataKey="amount" name="Total Value" fill="#FF8C00" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           <>
//             {/* Work Order Summary Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
//               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total Work Orders</h3>
//                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
//                   {totalWorkOrders}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (excl. GST)</h3>
//                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
//                   {formatCurrency(totalWorkOrderAmountWithoutGST)}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//                 <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (incl. GST)</h3>
//                 <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
//                   {formatCurrency(totalWorkOrderAmountWithGST)}
//                 </p>
//               </div>
//             </div>

//             {/* Work Order GST Summary */}
//             <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//               <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total GST</h3>
//               <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
//                 {formatCurrency(totalWorkOrderGST)}
//               </p>
//             </div>

//             {/* Work Order Charts Section */}
//             <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//               <h2 className={`text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 ${dmSans.className}`}>
//                 Work Order Value Trend (Last 6 Months)
//               </h2>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={workOrderTimelineData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis 
//                       tickFormatter={(value) => formatCurrency(value).replace('Rs ', '')}
//                       width={isMobile ? 60 : 80}
//                     />
//                     <Tooltip 
//                       formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
//                       labelFormatter={(label) => `Month: ${label}`}
//                     />
//                     <Legend />
//                     <Bar dataKey="amount" name="Total Value" fill="#FF8C00" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </>
//         )}
//       </main>
//     </div>
//     </ProtectedLayout>
//   )
// }

// export const dynamic = 'force-dynamic'


'use client'
import { useState } from 'react'
import { useEffect } from 'react';
import ProtectedRoute from '@/app/Components/ProtectedRoute';
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Components/sidebar'
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

interface Quotation {
  quotationId: string
  client: string
  date: string
  status: string
  amountWithoutGST: number
  gst: number
  amountWithGST: number
  preparedBy: string
}

interface WorkOrder {
  _id: string
  _createdAt: string
  salesOrderSection: {
    orderDetails: {
      poValue: number
      includesGST: boolean
    }
    termsAndConditions: {
      pricesIncludeGST: boolean
    }
  }
  purchaseOrderSection?: {
    poTable?: {
      description: string
      unit: string
      quantity: number
      unitRatePKR: number
      gstApplicable: boolean
      gstPercentage: number
      gstAmount: number
      totalAmountPKR: number
    }[]
  }
}

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   allowedPath: string;
// }

interface PreparedByStats {
  name: string
  today: number
  thisWeek: number
  thisMonth: number
  thisYear: number
  total: number
}

interface MonthlyRevenue {
  month: string
  revenue: number
  gst: number
  netRevenue: number
}

interface WorkOrderStats {
  month: string
  count: number
  totalValue: number
  averageValue: number
  totalWithoutGST: number
  totalGST: number
  totalWithGST: number
}

const STATUS_COLORS = {
  Draft: '#FBBF24',
  Sent: '#60A5FA',
  Accepted: '#34D399',
  Rejected: '#F87171',
  Expired: '#9CA3AF'
};

const PERIOD_COLORS = {
  today: '#FF0000',
  thisWeek: '#F59E0B',
  thisMonth: '#10B981',
  thisYear: '#3B82F6',
  total: '#6366F1'
};



export default function CombinedDashboard() {
  const [activeTab, setActiveTab] = useState<'quotations' | 'workorders'>('quotations')
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [preparedByStats, setPreparedByStats] = useState<PreparedByStats[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [workOrderStats, setWorkOrderStats] = useState<WorkOrderStats[]>([])


  // const router = useRouter();
  // const [loading, setLoading] = useState(true); // Track auth status

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem('user') || '{}');
  //   if (!user.username || user.redirect !== '/dashboard') {
  //     router.push('/login'); // Not authorized, redirect to login
  //   } else {
  //     setLoading(false); // Valid user, allow render
  //   }
  // }, [router]);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (activeTab === 'quotations') {
          const query = `*[_type == "quotation"]{
            quotationId,
            client,
            date,
            status,
            "amountWithoutGST": subtotal,
            gst,
            "amountWithGST": totalPrice,
            preparedBy
          } | order(date desc)`
          
          const result = await client.fetch<Quotation[]>(query)
          setQuotations(result)
          calculatePreparedByStats(result)
          calculateMonthlyRevenue(result)
        } else {
          const query = `*[_type == "workOrderSalesOrder"]{
            _id,
            _createdAt,
            salesOrderSection{
              orderDetails{
                poValue,
                includesGST
              },
              termsAndConditions{
                pricesIncludeGST
              }
            },
            purchaseOrderSection{
              poTable[]{
                description,
                unit,
                quantity,
                unitRatePKR,
                gstApplicable,
                gstPercentage,
                gstAmount,
                totalAmountPKR
              }
            }
          }`
          
          const result = await client.fetch<WorkOrder[]>(query)
          setWorkOrders(result)
          calculateWorkOrderStats(result)
        }
      } catch (err) {
        console.error(`Failed to fetch ${activeTab}`, err)
        setError(`Failed to load ${activeTab}`)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [activeTab])

  const calculateWorkOrderStats = (workOrders: WorkOrder[]) => {
    const monthlyData: Record<string, WorkOrderStats> = {}

    workOrders.forEach(wo => {
      const date = new Date(wo._createdAt)
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count: 0,
          totalValue: 0,
          averageValue: 0,
          totalWithoutGST: 0,
          totalGST: 0,
          totalWithGST: 0
        }
      }

      // Calculate from PO table if available
      let woWithoutGST = 0
      let woGST = 0
      let woWithGST = 0

      if (wo.purchaseOrderSection?.poTable) {
        wo.purchaseOrderSection.poTable.forEach(item => {
          const amount = item.quantity * item.unitRatePKR
          if (item.gstApplicable) {
            woWithoutGST += amount
            woGST += item.gstAmount || (amount * (item.gstPercentage || 0) / 100)
            woWithGST += item.totalAmountPKR
          } else {
            woWithoutGST += amount
            woWithGST += amount
          }
        })
      } else {
        // Fallback to sales order section if PO table not available
        const poValue = wo.salesOrderSection?.orderDetails?.poValue || 0
        const includesGST = wo.salesOrderSection?.termsAndConditions?.pricesIncludeGST || false
        
        if (includesGST) {
          woWithoutGST = poValue / 1.17
          woGST = poValue - woWithoutGST
          woWithGST = poValue
        } else {
          woWithoutGST = poValue
          woWithGST = poValue
        }
      }

      monthlyData[monthYear].count += 1
      monthlyData[monthYear].totalValue += woWithGST
      monthlyData[monthYear].totalWithoutGST += woWithoutGST
      monthlyData[monthYear].totalGST += woGST
      monthlyData[monthYear].totalWithGST += woWithGST
    })

    // Calculate averages
    Object.values(monthlyData).forEach(month => {
      month.averageValue = month.totalValue / month.count
    })

    const sortedData = Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })

    setWorkOrderStats(sortedData.slice(-6)) // Show last 6 months
  }

  const calculateMonthlyRevenue = (quotations: Quotation[]) => {
    const monthlyData: Record<string, MonthlyRevenue> = {}

    quotations.forEach(quote => {
      const date = new Date(quote.date)
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: 0,
          gst: 0,
          netRevenue: 0
        }
      }

      monthlyData[monthYear].revenue += quote.amountWithoutGST || 0
      monthlyData[monthYear].gst += quote.gst || 0
      monthlyData[monthYear].netRevenue += quote.amountWithGST || 0
    })

    const sortedData = Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })

    setMonthlyRevenue(sortedData.slice(-6)) // Show last 6 months
  }

  const calculatePreparedByStats = (quotations: Quotation[]) => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    const statsMap: Record<string, PreparedByStats> = {}

    quotations.forEach(quote => {
      const quoteDate = new Date(quote.date);
      const preparedBy = quote.preparedBy || 'Unknown';

      if (!statsMap[preparedBy]) {
        statsMap[preparedBy] = {
          name: preparedBy,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          thisYear: 0,
          total: 0
        }
      }

      statsMap[preparedBy].total++;

      if (quoteDate >= todayStart) {
        statsMap[preparedBy].today++;
      }
      if (quoteDate >= thisWeekStart) {
        statsMap[preparedBy].thisWeek++;
      }
      if (quoteDate >= thisMonthStart) {
        statsMap[preparedBy].thisMonth++;
      }
      if (quoteDate >= thisYearStart) {
        statsMap[preparedBy].thisYear++;
      }
    })

    setPreparedByStats(Object.values(statsMap).sort((a, b) => b.total - a.total))
  }

  const formatCurrency = (amount: number) => {
    const currencySymbol = activeTab === 'quotations' ? 'INR' : 'PKR'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencySymbol,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace(currencySymbol === 'INR' ? '₹' : 'PKR', 'Rs ')
  }

  const prepareQuotationStatusData = () => {
    const statusCounts = quotations.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#888'
    }))
  }

  const prepareWorkOrderTimelineData = () => {
    return workOrderStats.map(stat => ({
      month: stat.month,
      count: stat.count,
      totalValue: stat.totalValue,
      averageValue: stat.averageValue,
      totalWithoutGST: stat.totalWithoutGST,
      totalGST: stat.totalGST,
      totalWithGST: stat.totalWithGST
    }))
  }

  const quotationStatusData = prepareQuotationStatusData()
  const workOrderTimelineData = prepareWorkOrderTimelineData()

  // Calculate totals for quotations
  const totalQuotations = quotations.length
  const totalQuotationAmountWithoutGST = quotations.reduce((sum, q) => sum + (q.amountWithoutGST || 0), 0)
  const totalQuotationGST = quotations.reduce((sum, q) => sum + (q.gst || 0), 0)
  const totalQuotationAmountWithGST = quotations.reduce((sum, q) => sum + (q.amountWithGST || 0), 0)

  // Calculate totals for work orders
  const totalWorkOrders = workOrders.length
  const totalWorkOrderWithoutGST = workOrderStats.reduce((sum, stat) => sum + stat.totalWithoutGST, 0)
  const totalWorkOrderGST = workOrderStats.reduce((sum, stat) => sum + stat.totalGST, 0)
  const totalWorkOrderWithGST = workOrderStats.reduce((sum, stat) => sum + stat.totalWithGST, 0)
  const averageWorkOrderValue = totalWorkOrders > 0 ? totalWorkOrderWithGST / totalWorkOrders : 0

  // Get status counts for quotations
  const statusCounts = quotations.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

if (isLoading) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
      </div>
    </div>
  );
}


  if (error) {
    return (
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <p className="font-medium">{error}</p>
          </div>
        </main>
      </div>
    )
  }

// const router = useRouter();

// // ✅ Always call hooks before any conditional return
// useEffect(() => {
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   if (!user.username || user.redirect !== '/dashboard') {
//     router.push('/login');
//   }
// }, []);


  return (
   <ProtectedRoute allowedUser="director">
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <Sidebar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 gap-4">
          <div className="space-y-2 pt-10 pl-5 w-full md:w-auto">
            <h1 className={`text-2xl sm:text-3xl pr-3 font-bold text-[#8B5E3C] ${dmSans.className}`}>
              {activeTab === 'quotations' ? 'Dashboard (Quotations)' : 'Dashboard (Work Orders)' }
            </h1>
          </div>
          <div className={`flex space-x-2 w-full md:w-auto pb-4 md:pb-0 pl-5 md:pl-0 ${dmSans.variable} font-sans`}>
            <button
              onClick={() => setActiveTab('quotations')}
              className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium ${
                activeTab === 'quotations' 
                  ? 'bg-[#8B5E3C] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Quotations
            </button>
            <button
              onClick={() => setActiveTab('workorders')}
              className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium ${
                activeTab === 'workorders' 
                  ? 'bg-[#8B5E3C] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Work Orders
            </button>
          </div>
        </div>

        {activeTab === 'quotations' ? (
          <div className="space-y-6">
            {/* Enhanced Quotation Summary */}
            <div className="bg-gradient-to-r from-[#8B5E3C]/10 to-[#FBBF24]/10 p-6 rounded-xl shadow-lg border border-[#8B5E3C]/20">
              <h2 className={`text-xl sm:text-2xl font-bold text-[#8B5E3C] mb-6 ${dmSans.className} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Quotation Insights
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Quotations Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#8B5E3C] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total Quotations</p>
                      <p className={`text-3xl font-bold mt-1 text-[#8B5E3C] ${dmSans.className}`}>{totalQuotations}</p>
                    </div>
                    <div className="bg-[#8B5E3C]/10 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8B5E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Total Value Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#34D399] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total Value</p>
                      <p className={`text-2xl font-bold mt-1 text-[#34D399] ${dmSans.className}`}>{formatCurrency(totalQuotationAmountWithGST)}</p>
                    </div>
                    <div className="bg-[#34D399]/10 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Average Value Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#60A5FA] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Average Value</p>
                      <p className={`text-2xl font-bold mt-1 text-[#60A5FA] ${dmSans.className}`}>
                        {totalQuotations > 0 ? formatCurrency(totalQuotationAmountWithGST / totalQuotations) : formatCurrency(0)}
                      </p>
                    </div>
                    <div className="bg-[#60A5FA]/10 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#60A5FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Accepted Rate Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#F87171] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Acceptance Rate</p>
                      <p className={`text-2xl font-bold mt-1 text-[#F87171] ${dmSans.className}`}>
                        {totalQuotations > 0 
                          ? `${Math.round((statusCounts['Accepted'] || 0) / totalQuotations * 100)}%` 
                          : '0%'}
                      </p>
                    </div>
                    <div className="bg-[#F87171]/10 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="mt-8">
                <h3 className={`text-lg font-semibold text-[#8B5E3C] mb-4 ${dmSans.className}`}>Revenue Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Amount Without GST */}
                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full mr-3 bg-blue-500"></span>
                      <div>
                        <p className={`font-medium text-gray-700 ${dmSans.className}`}>Total Amount (Without GST)</p>
                        <div className="flex items-baseline">
                          <p className={`text-2xl font-bold ${dmSans.className}`}>{formatCurrency(totalQuotationAmountWithoutGST)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total GST */}
                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full mr-3 bg-green-500"></span>
                      <div>
                        <p className={`font-medium text-gray-700 ${dmSans.className}`}>Total GST</p>
                        <div className="flex items-baseline">
                          <p className={`text-2xl font-bold ${dmSans.className}`}>{formatCurrency(totalQuotationGST)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Amount With GST */}
                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full mr-3 bg-red-600"></span>
                      <div>
                        <p className={`font-medium text-gray-700 ${dmSans.className}`}>Total Amount (With GST)</p>
                        <div className="flex items-baseline">
                          <p className={`text-2xl font-bold ${dmSans.className}`}>{formatCurrency(totalQuotationAmountWithGST)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="mt-8">
                <h3 className={`text-lg font-semibold text-[#8B5E3C] mb-4 ${dmSans.className}`}>Status Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-4 h-4 rounded-full mr-3" 
                          style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#888' }}
                        />
                        <div>
                          <p className={`font-medium text-gray-700 ${dmSans.className}`}>{status}</p>
                          <div className="flex items-baseline">
                            <p className={`text-2xl font-bold ${dmSans.className}`}>{count}</p>
                            <p className={`text-sm text-gray-500 ml-2 ${dmSans.className}`}>
                              ({Math.round((count / totalQuotations) * 100)}%)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className={`text-xl sm:text-2xl font-bold text-[#8B5E3C] mb-6 ${dmSans.className} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Revenue Trend (Last 6 Months)
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyRevenue}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('Rs ', '')}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                      contentStyle={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: 'none'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Amount Without GST" fill="#3B82F6" />
                    <Bar dataKey="gst" name="GST" fill="#10B981" />
                    <Bar dataKey="netRevenue" name="Amount With GST" fill="#FF0000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Enhanced Prepared By Statistics */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className={`text-xl sm:text-2xl font-bold text-[#8B5E3C] mb-6 ${dmSans.className} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Team Performance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {preparedByStats.map((person, index) => {
                  // Calculate percentages for progress bars
                  const maxQuotes = Math.max(
                    ...preparedByStats.map(p => p.total),
                    preparedByStats[0]?.total || 1
                  )
                  const totalPercentage = (person.total / maxQuotes) * 100
                  
                  return (
                    <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className={`text-lg font-bold text-gray-800 ${dmSans.className}`}>{person.name}</h3>
                          <p className={`text-sm text-gray-500 ${dmSans.className}`}>Total: {person.total} quotations</p>
                        </div>
                        <div className="bg-[#8B5E3C]/10 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8B5E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Main Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className={`text-xs font-medium text-gray-500 ${dmSans.className}`}>Overall Performance</span>
                          <span className={`text-xs font-medium text-[#8B5E3C] ${dmSans.className}`}>{person.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#8B5E3C] h-2 rounded-full" 
                            style={{ width: `${totalPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Time Period Stats */}
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PERIOD_COLORS.today }}></div>
                          <span className={`text-xs text-gray-600 w-16 ${dmSans.className}`}>Today</span>
                          <div className="flex-1 ml-2">
                            <div className="flex justify-between text-xs">
                              <span>{person.today}</span>
                              <span>{person.total > 0 ? Math.round((person.today / person.total) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="h-1 rounded-full" 
                                style={{ 
                                  width: `${(person.today / (person.total || 1)) * 100}%`,
                                  backgroundColor: PERIOD_COLORS.today
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PERIOD_COLORS.thisWeek }}></div>
                          <span className={`text-xs text-gray-600 w-16 ${dmSans.className}`}>This Week</span>
                          <div className="flex-1 ml-2">
                            <div className="flex justify-between text-xs">
                              <span>{person.thisWeek}</span>
                              <span>{person.total > 0 ? Math.round((person.thisWeek / person.total) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="h-1 rounded-full" 
                                style={{ 
                                  width: `${(person.thisWeek / (person.total || 1)) * 100}%`,
                                  backgroundColor: PERIOD_COLORS.thisWeek
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PERIOD_COLORS.thisMonth }}></div>
                          <span className={`text-xs text-gray-600 w-16 ${dmSans.className}`}>This Month</span>
                          <div className="flex-1 ml-2">
                            <div className="flex justify-between text-xs">
                              <span>{person.thisMonth}</span>
                              <span>{person.total > 0 ? Math.round((person.thisMonth / person.total) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="h-1 rounded-full" 
                                style={{ 
                                  width: `${(person.thisMonth / (person.total || 1)) * 100}%`,
                                  backgroundColor: PERIOD_COLORS.thisMonth
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PERIOD_COLORS.thisYear }}></div>
                          <span className={`text-xs text-gray-600 w-16 ${dmSans.className}`}>This Year</span>
                          <div className="flex-1 ml-2">
                            <div className="flex justify-between text-xs">
                              <span>{person.thisYear}</span>
                              <span>{person.total > 0 ? Math.round((person.thisYear / person.total) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="h-1 rounded-full" 
                                style={{ 
                                  width: `${(person.thisYear / (person.total || 1)) * 100}%`,
                                  backgroundColor: PERIOD_COLORS.thisYear
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className={`text-xl sm:text-2xl font-bold text-[#8B5E3C] mb-6 ${dmSans.className} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Visual Status Distribution
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Array.isArray(quotationStatusData) ? quotationStatusData : []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={isMobile ? 80 : 100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => {
                        const safePercent = percent ? (percent * 100).toFixed(0) : 0;
                        return `${name || 'Unknown'}: ${safePercent}%`;
                      }}
                    >
                      {(quotationStatusData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry?.color || '#ccc'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value ?? 0} quotations`, 'Count']}
                      contentStyle={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: 'none'
                      }}
                    />
                    <Legend 
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enhanced Work Order Summary */}
            <div className="bg-gradient-to-r from-[#8B5E3C]/10 to-[#FBBF24]/10 p-6 rounded-xl shadow-lg border border-[#8B5E3C]/20">
              <h2 className={`text-xl sm:text-2xl font-bold text-[#8B5E3C] mb-6 ${dmSans.className} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Work Order Insights
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Work Orders Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#8B5E3C] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Total Work Orders</p>
                      <p className={`text-3xl font-bold mt-1 text-[#8B5E3C] ${dmSans.className}`}>{totalWorkOrders}</p>
                    </div>
                    <div className="bg-[#8B5E3C]/10 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8B5E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Average Value Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#60A5FA] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Average Value</p>
                      <p className={`text-2xl font-bold mt-1 text-[#60A5FA] ${dmSans.className}`}>
                        {formatCurrency(averageWorkOrderValue)}
                      </p>
                    </div>
                    <div className="bg-[#60A5FA]/10 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#60A5FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Conversion Rate Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#34D399] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-gray-500 text-sm font-medium ${dmSans.className}`}>Conversion Rate</p>
                      <p className={`text-2xl font-bold mt-1 text-[#34D399] ${dmSans.className}`}>
                        {totalQuotations > 0 
                          ? `${Math.round((totalWorkOrders / totalQuotations) * 100)}%` 
                          : '0%'}
                      </p>
                    </div>
                    <div className="bg-[#34D399]/10 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="mt-8">
                <h3 className={`text-lg font-semibold text-[#8B5E3C] mb-4 ${dmSans.className}`}>Revenue Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Amount Without GST */}
                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full mr-3 bg-blue-500"></span>
                      <div>
                        <p className={`font-medium text-gray-700 ${dmSans.className}`}>Total Amount (Without GST)</p>
                        <div className="flex items-baseline">
                          <p className={`text-2xl font-bold ${dmSans.className}`}>{formatCurrency(totalWorkOrderWithoutGST)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total GST */}
                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full mr-3 bg-green-500"></span>
                      <div>
                        <p className={`font-medium text-gray-700 ${dmSans.className}`}>Total GST</p>
                        <div className="flex items-baseline">
                          <p className={`text-2xl font-bold ${dmSans.className}`}>{formatCurrency(totalWorkOrderGST)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Amount With GST */}
                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full mr-3 bg-red-600"></span>
                      <div>
                        <p className={`font-medium text-gray-700 ${dmSans.className}`}>Total Amount (With GST)</p>
                        <div className="flex items-baseline">
                          <p className={`text-2xl font-bold ${dmSans.className}`}>{formatCurrency(totalWorkOrderWithGST)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Order Trend Charts */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Work Order Count Trend */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h3 className={`text-lg font-semibold text-[#8B5E3C] mb-4 ${dmSans.className}`}>
                    Work Order Volume (Last 6 Months)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={workOrderTimelineData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: 'none'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="Work Orders" stroke="#FF0000" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Work Order Value Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h3 className={`text-lg font-semibold text-[#8B5E3C] mb-4 ${dmSans.className}`}>
                    Revenue Breakdown (Last 6 Months)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={workOrderTimelineData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(value).replace('Rs ', '')}
                          width={100}
                        />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                          contentStyle={{
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: 'none'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="totalWithoutGST" name="Amount Without GST" fill="#3B82F6" />
                        <Bar dataKey="totalGST" name="GST" fill="#10B981" />
                        <Bar dataKey="totalWithGST" name="Amount With GST" fill="#FF0000" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Work Orders */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className={`text-xl sm:text-2xl font-bold text-[#8B5E3C] mb-6 ${dmSans.className} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Recent Work Orders
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${dmSans.className}`}>
                        Created Date
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${dmSans.className}`}>
                        Amount (Without GST)
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${dmSans.className}`}>
                        GST
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${dmSans.className}`}>
                        Total Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workOrders.slice(0, 5).map((wo, index) => {
                      // Calculate amounts for each work order
                      let woWithoutGST = 0
                      let woGST = 0
                      let woWithGST = 0

                      if (wo.purchaseOrderSection?.poTable) {
                        wo.purchaseOrderSection.poTable.forEach(item => {
                          const amount = item.quantity * item.unitRatePKR
                          if (item.gstApplicable) {
                            woWithoutGST += amount
                            woGST += item.gstAmount || (amount * (item.gstPercentage || 0) / 100)
                            woWithGST += item.totalAmountPKR
                          } else {
                            woWithoutGST += amount
                            woWithGST += amount
                          }
                        })
                      } else {
                        // Fallback to sales order section if PO table not available
                        const poValue = wo.salesOrderSection?.orderDetails?.poValue || 0
                        const includesGST = wo.salesOrderSection?.termsAndConditions?.pricesIncludeGST || false
                        
                        if (includesGST) {
                          woWithoutGST = poValue / 1.17
                          woGST = poValue - woWithoutGST
                          woWithGST = poValue
                        } else {
                          woWithoutGST = poValue
                          woWithGST = poValue
                        }
                      }

                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${dmSans.className}`}>
                            {new Date(wo._createdAt).toLocaleDateString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${dmSans.className}`}>
                            {formatCurrency(woWithoutGST)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${dmSans.className}`}>
                            {formatCurrency(woGST)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 ${dmSans.className}`}>
                            {formatCurrency(woWithGST)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </ProtectedRoute>
  )
}

export const dynamic = 'force-dynamic'