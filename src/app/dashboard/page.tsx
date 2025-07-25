'use client'
import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Components/sidebar'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
}

interface WorkOrder {
  _id: string
  _createdAt: string
  salesOrderSection: {
    orderDetails: {
      poValue: number
    }
    termsAndConditions: {
      pricesIncludeGST: boolean
    }
  }
}

const STATUS_COLORS = {
  Draft: '#FBBF24',
  Sent: '#60A5FA',
  Accepted: '#34D399',
  Rejected: '#F87171',
  Expired: '#9CA3AF'
};

export default function CombinedDashboard() {
  const [activeTab, setActiveTab] = useState<'quotations' | 'workorders'>('quotations')
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all')
  const [isMobile, setIsMobile] = useState(false)

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
            "amountWithGST": totalPrice
          } | order(date desc)`
          
          const result = await client.fetch<Quotation[]>(query)
          setQuotations(result)
        } else {
          const query = `*[_type == "workOrderSalesOrder"]{
            _id,
            _createdAt,
            salesOrderSection{
              orderDetails{
                poValue
              },
              termsAndConditions{
                pricesIncludeGST
              }
            }
          }`
          
          const result = await client.fetch<WorkOrder[]>(query)
          setWorkOrders(result)
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

  // Filter quotations based on selected filters
  const filteredQuotations = quotations.filter(quotation => {
    // Status filter
    const statusMatch = statusFilter === 'all' || quotation.status === statusFilter
    
    // Date range filter
    let dateMatch = true
    if (dateRangeFilter !== 'all') {
      const now = new Date()
      const quoteDate = new Date(quotation.date)
      
      switch(dateRangeFilter) {
        case 'today':
          dateMatch = quoteDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          weekStart.setHours(0, 0, 0, 0)
          dateMatch = quoteDate >= weekStart
          break
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          dateMatch = quoteDate >= monthStart
          break
        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1)
          dateMatch = quoteDate >= yearStart
          break
      }
    }
    
    return statusMatch && dateMatch
  })

  const displayQuotations = filteredQuotations
  const displayWorkOrders = workOrders

  // Quotation calculations
  const totalQuotations = displayQuotations.length
  const totalQuotationAmountWithoutGST = displayQuotations.reduce((sum, q) => sum + (q.amountWithoutGST || 0), 0)
  const totalQuotationGST = displayQuotations.reduce((sum, q) => sum + (q.gst || 0), 0)
  const totalQuotationAmountWithGST = displayQuotations.reduce((sum, q) => sum + (q.amountWithGST || 0), 0)

  // Work Order calculations
  const totalWorkOrders = displayWorkOrders.length
  const totalWorkOrderAmountWithGST = displayWorkOrders.reduce((sum, wo) => sum + (wo.salesOrderSection?.orderDetails?.poValue || 0), 0)
  const totalWorkOrderAmountWithoutGST = displayWorkOrders.reduce((sum, wo) => {
    const poValue = wo.salesOrderSection?.orderDetails?.poValue || 0
    if (wo.salesOrderSection?.termsAndConditions?.pricesIncludeGST) {
      return sum + (poValue / 1.17)
    }
    return sum + poValue
  }, 0)
  const totalWorkOrderGST = totalWorkOrderAmountWithGST - totalWorkOrderAmountWithoutGST

  const formatCurrency = (amount: number) => {
    const currencySymbol = activeTab === 'quotations' ? 'INR' : 'PKR'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencySymbol,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace(currencySymbol === 'INR' ? '₹' : 'PKR', 'Rs ')
  }

  // Prepare data for charts
  const prepareQuotationStatusData = () => {
    const statusCounts = displayQuotations.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#888'
    }))
  }

  const prepareMonthlyQuotationData = () => {
    const monthlyData = displayQuotations.reduce((acc, q) => {
      const date = new Date(q.date)
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          amount: 0,
          count: 0
        }
      }
      
      acc[monthYear].amount += q.amountWithGST || 0
      acc[monthYear].count += 1
      return acc
    }, {} as Record<string, { month: string; amount: number; count: number }>)

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
  }

  const prepareWorkOrderTimelineData = () => {
    const monthlyData = displayWorkOrders.reduce((acc, wo) => {
      const date = new Date(wo._createdAt)
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          amount: 0,
          count: 0
        }
      }
      
      const poValue = wo.salesOrderSection?.orderDetails?.poValue || 0
      acc[monthYear].amount += poValue
      acc[monthYear].count += 1
      return acc
    }, {} as Record<string, { month: string; amount: number; count: number }>)

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
  }

  const quotationStatusData = prepareQuotationStatusData()
  const monthlyQuotationData = prepareMonthlyQuotationData()
  const workOrderTimelineData = prepareWorkOrderTimelineData()

  const statusOptions = ['all', ...Array.from(new Set(quotations.map(q => q.status)))]

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <Sidebar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <Sidebar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <p className="font-medium">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <Sidebar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 gap-4">
          <div className="space-y-2 pt-10 pl-5 w-full md:w-auto">
            <h1 className={`text-2xl sm:text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
              {activeTab === 'quotations' ? 'Quotation Dashboard' : 'Work Order Dashboard'}
            </h1>
            <p className={`text-gray-600 text-sm sm:text-base ${dmSans.className}`}>
              {activeTab === 'quotations' ? 'Overview of all quotations' : 'Overview of all work orders'}
            </p>
          </div>
          <div className="flex space-x-2 w-full md:w-auto pb-4 md:pb-0 pl-5 md:pl-0">
            <button
              onClick={() => setActiveTab('quotations')}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base ${
                activeTab === 'quotations' 
                  ? 'bg-[#8B5E3C] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Quotations
            </button>
            <button
              onClick={() => setActiveTab('workorders')}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base ${
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
          <>
            {/* Filter Section */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* Status Filter */}
  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
    <h2
      className={`text-base sm:text-lg md:text-xl font-semibold text-[#8B5E3C] mb-3 sm:mb-4 pb-2 border-b ${dmSans.className}`}
    >
      Filter Options
    </h2>
    <div className="space-y-3">
      <div>
        <label
          htmlFor="statusFilter"
          className={`block text-sm sm:text-base font-medium text-gray-600 ${dmSans.className}`}
        >
          Status
        </label>
        <div className="relative w-full">
          <select
            id="statusFilter"
            className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#8B5E3C] focus:ring-[#8B5E3C] 
              p-2 sm:p-3 text-sm sm:text-base md:text-lg appearance-none pr-10 ${dmSans.className}`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((status) => (
              <option
                key={status}
                value={status}
                className={`text-sm sm:text-base md:text-lg ${dmSans.className}`}
              >
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
          {/* ▼ Custom dropdown arrow */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            ▼
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Date Range Filter */}
  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
    <h2
      className={`text-base sm:text-lg md:text-xl font-semibold text-[#8B5E3C] mb-3 sm:mb-4 pb-2 border-b ${dmSans.className}`}
    >
      Date Range
    </h2>
    <div className="space-y-3">
      <div>
        <label
          htmlFor="dateRangeFilter"
          className={`block text-sm sm:text-base font-medium text-gray-600 ${dmSans.className}`}
        >
          Time Period
        </label>
        <div className="relative w-full">
          <select
            id="dateRangeFilter"
            className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#8B5E3C] focus:ring-[#8B5E3C] 
              p-2 sm:p-3 text-sm sm:text-base md:text-lg appearance-none pr-10 ${dmSans.className}`}
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          {/* ▼ Custom dropdown arrow */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            ▼
          </span>
        </div>
      </div>
    </div>
  </div>
</div>


            {/* Quotation Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total Quotations</h3>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
                  {totalQuotations}
                </p>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (excl. GST)</h3>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
                  {formatCurrency(totalQuotationAmountWithoutGST)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total GST</h3>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
                  {formatCurrency(totalQuotationGST)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (incl. GST)</h3>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
                  {formatCurrency(totalQuotationAmountWithGST)}
                </p>
              </div>
            </div>

            {/* Quotation Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Status Breakdown Pie Chart */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className={`text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 ${dmSans.className}`}>
                  Quotation Status Distribution
                </h2>
              <div className="h-64">
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={Array.isArray(quotationStatusData) ? quotationStatusData : []}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={isMobile ? 70 : 80}
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
      <Tooltip formatter={(value: number) => [`${value ?? 0} quotations`, 'Count']} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

              </div>

              {/* Monthly Trend Bar Chart */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className={`text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 ${dmSans.className}`}>
                  Monthly Quotation Value Trend
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyQuotationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value).replace('Rs ', '')}
                        width={isMobile ? 60 : 80}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="amount" name="Total Value" fill="#FF8C00" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Work Order Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total Work Orders</h3>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
                  {totalWorkOrders}
                </p>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (excl. GST)</h3>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
                  {formatCurrency(totalWorkOrderAmountWithoutGST)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total (incl. GST)</h3>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
                  {formatCurrency(totalWorkOrderAmountWithGST)}
                </p>
              </div>
            </div>

            {/* Work Order GST Summary */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className={`text-gray-500 text-xs sm:text-sm font-medium ${dmSans.className}`}>Total GST</h3>
              <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-black ${dmSans.className}`}>
                {formatCurrency(totalWorkOrderGST)}
              </p>
            </div>

            {/* Work Order Charts Section */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className={`text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 ${dmSans.className}`}>
                Work Order Value Trend (Last 6 Months)
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workOrderTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('Rs ', '')}
                      width={isMobile ? 60 : 80}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="amount" name="Total Value" fill="#FF8C00" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export const dynamic = 'force-dynamic'