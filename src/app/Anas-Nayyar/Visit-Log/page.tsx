'use client'

import { useState, useEffect, useCallback } from 'react'
import { client } from '@/sanity/lib/client'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Anas-Nayyar/Components/sidebar'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

interface AttendanceRecord {
  _id: string
  _createdAt: string
  employee: {
    name: string
  }
  date: string
  workLocationType?: 'office' | 'remote' | 'client_visit'
  clientName?: string
  clientLocation?: string
  checkIn?: string
  location?: {
    address?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  summaryOfWork?: string
  followUps?: string
  notes?: string
  verified?: boolean
}

interface NewAttendance {
  employee: {
    name: string
  }
  date: string
  workLocationType?: 'office' | 'remote' | 'client_visit'
  clientName?: string
  clientLocation?: string
  checkIn?: string
  location?: {
    address?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  summaryOfWork?: string
  followUps?: string
  notes?: string
}

type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all'

export default function AnasAttendanceForm() {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([])
 const [isLoading] = useState(true)
  const [filteredList, setFilteredList] = useState<AttendanceRecord[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today')
  const [summaryStats, setSummaryStats] = useState({
    totalVisits: 0,
    clientVisits: 0,
    officeDays: 0,
    remoteDays: 0,
    lastVisitDate: '',
  })

  const [newRecord, setNewRecord] = useState<NewAttendance>({
    employee: { name: 'Anas Nayyar' },
    date: new Date().toISOString().split('T')[0],
    checkIn: new Date().toTimeString().slice(0, 5),
    workLocationType: 'client_visit',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchAttendanceList = useCallback(async () => {
    setLoadingAttendance(true)
    try {
      const query = `*[_type == "attendance" && employee.name == "Anas Nayyar"]{
        _id,
        _createdAt,
        employee,
        date,
        workLocationType,
        clientName,
        clientLocation,
        checkIn,
        location {
          address,
          coordinates
        },
        summaryOfWork,
        followUps,
        notes,
        verified
      } | order(date desc, _createdAt desc)`
      const data: AttendanceRecord[] = await client.fetch(query)
      setAttendanceList(data)
      filterData(data, timeFilter)
      
      const stats = {
        totalVisits: data.length,
        clientVisits: data.filter(r => r.workLocationType === 'client_visit').length,
        officeDays: data.filter(r => r.workLocationType === 'office').length,
        remoteDays: data.filter(r => r.workLocationType === 'remote').length,
        lastVisitDate: data.length > 0 ? new Date(data[0].date).toLocaleDateString() : 'No records'
      }
      setSummaryStats(stats)
    } catch (err) {
      console.error('Error fetching attendance list:', err)
    } finally {
      setLoadingAttendance(false)
    }
  }, [timeFilter])

  const filterData = (data: AttendanceRecord[], filter: TimeFilter) => {
    const now = new Date()
    let filteredData = [...data]

    switch (filter) {
      case 'today':
        const today = now.toISOString().split('T')[0]
        filteredData = data.filter(record => record.date === today)
        break
      case 'week':
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0]
        filteredData = data.filter(record => record.date >= oneWeekAgo)
        break
      case 'month':
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0]
        filteredData = data.filter(record => record.date >= oneMonthAgo)
        break
      case 'year':
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0]
        filteredData = data.filter(record => record.date >= oneYearAgo)
        break
      case 'all':
      default:
        filteredData = data
    }

    setFilteredList(filteredData)
  }

  const updateCurrentTime = () => {
    const now = new Date()
    setNewRecord((prev) => ({
      ...prev,
      checkIn: now.toTimeString().slice(0, 5),
      date: now.toISOString().split('T')[0],
    }))
  }

  const handleWorkLocationChange = (type: 'office' | 'remote' | 'client_visit') => {
    setNewRecord((prev) => ({
      ...prev,
      workLocationType: type,
      clientName: type === 'client_visit' ? prev.clientName : undefined,
      clientLocation: type === 'client_visit' ? prev.clientLocation : undefined,
    }))
  }

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter)
    filterData(attendanceList, filter)
  }

  useEffect(() => {
    const getLocation = async () => {
      if (!navigator.geolocation) return

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        )
        const { latitude, longitude } = position.coords
        let address = 'Location not identified'

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await res.json()
          address = data.display_name || address
        } catch (err) {
          console.warn('Reverse geocoding failed', err)
        }

        setNewRecord((prev) => ({
          ...prev,
          location: {
            address,
            coordinates: { lat: latitude, lng: longitude },
          },
        }))
      } catch (err) {
        console.error('Location error', err)
      }
    }

    getLocation()
    updateCurrentTime()
    fetchAttendanceList()
  }, [fetchAttendanceList])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    // Additional validation
    if (newRecord.workLocationType === 'client_visit' && (!newRecord.clientName || !newRecord.clientLocation)) {
      setError('Client name and location are required for client visits')
      setIsSubmitting(false)
      return
    }

    if (!newRecord.summaryOfWork || newRecord.summaryOfWork.length < 50) {
      setError('Please provide a detailed summary (at least 50 characters)')
      setIsSubmitting(false)
      return
    }

    if (!newRecord.followUps || newRecord.followUps.length < 30) {
      setError('Please provide detailed follow-ups (at least 30 characters)')
      setIsSubmitting(false)
      return
    }

    try {
      const checkInTime = newRecord.checkIn
        ? new Date(`${newRecord.date}T${newRecord.checkIn}`).toISOString()
        : new Date().toISOString()

      const doc = {
        _type: 'attendance',
        employee: {
          name: newRecord.employee.name.trim(),
        },
        date: newRecord.date,
        workLocationType: newRecord.workLocationType,
        clientName: newRecord.clientName?.trim(),
        clientLocation: newRecord.clientLocation?.trim(),
        checkIn: checkInTime,
        location: newRecord.location,
        summaryOfWork: newRecord.summaryOfWork?.trim(),
        followUps: newRecord.followUps?.trim(),
        notes: newRecord.notes?.trim(),
        verified: false,
      }

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create attendance')
      }

      setSuccess(`Sales visit log created successfully for ${new Date().toLocaleDateString()}`)

      setNewRecord({
        employee: { name: 'Anas Nayyar' },
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toTimeString().slice(0, 5),
        workLocationType: 'client_visit',
        clientName: '',
        clientLocation: '',
        summaryOfWork: '',
        followUps: '',
        notes: '',
      })

      fetchAttendanceList()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
      </div>
    </div>
  );
}

  return (
    <ProtectedRoute allowedUser='gm-sales'>
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <Sidebar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b pb-6">
          <div className="space-y-2">
            <h1 className={`text-3xl font-bold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
              Anas Nayyar - Sales Visit Log
            </h1>
            <p className={`text-gray-600 tracking-wide ${dmSans.className}`}>Daily sales visit log form</p>
          </div>
          <button
            onClick={updateCurrentTime}
            className={`bg-[#8B5E3C] text-white px-4 py-2 rounded tracking-wide ${dmSans.className}`}
          >
            Refresh Time
          </button>
        </div>

        {/* Summary Statistics Section */}
        <div className="bg-[#F5F5F5] p-6 rounded-lg shadow-sm">
          <h2 className={`text-2xl font-semibold text-[#8B5E3C] mb-4 tracking-wide ${dmSans.className}`}>
            Summary Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className={`text-gray-500 tracking-wide ${dmSans.className}`}>Total Logs</h3>
              <p className={`text-2xl font-bold tracking-wide ${dmSans.className}`}>{summaryStats.totalVisits}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className={`text-gray-500 tracking-wide ${dmSans.className}`}>Client Visits</h3>
              <p className={`text-2xl font-bold tracking-wide ${dmSans.className}`}>{summaryStats.clientVisits}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className={`text-gray-500 tracking-wide ${dmSans.className}`}>Office Days</h3>
              <p className={`text-2xl font-bold tracking-wide ${dmSans.className}`}>{summaryStats.officeDays}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className={`text-gray-500 tracking-wide ${dmSans.className}`}>Last Visit</h3>
              <p className={`text-2xl font-bold tracking-wide ${dmSans.className}`}>{summaryStats.lastVisitDate}</p>
            </div>
          </div>
        </div>

        {/* Sales Visit Form */}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
          <h2 className={`text-2xl font-semibold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
            Today&apos;s Sales Visit Log
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 tracking-wide ${dmSans.className}`}>
                Employee Name
              </label>
              <input
                className={`border w-full px-3 py-2 rounded bg-gray-100 tracking-wide ${dmSans.className}`}
                value={newRecord.employee.name}
                readOnly
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 tracking-wide ${dmSans.className}`}>
                Date
              </label>
              <input
                type="date"
                className={`border w-full px-3 py-2 rounded bg-gray-100 tracking-wide ${dmSans.className}`}
                value={newRecord.date}
                readOnly
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 tracking-wide ${dmSans.className}`}>
                Work Location Type *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleWorkLocationChange('office')}
                  className={`px-3 py-1 rounded tracking-wide ${dmSans.className} ${
                    newRecord.workLocationType === 'office'
                      ? 'bg-[#8B5E3C] text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  Office
                </button>
                <button
                  type="button"
                  onClick={() => handleWorkLocationChange('remote')}
                  className={`px-3 py-1 rounded tracking-wide ${dmSans.className} ${
                    newRecord.workLocationType === 'remote'
                      ? 'bg-[#8B5E3C] text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  Remote
                </button>
                <button
                  type="button"
                  onClick={() => handleWorkLocationChange('client_visit')}
                  className={`px-3 py-1 rounded tracking-wide ${dmSans.className} ${
                    newRecord.workLocationType === 'client_visit'
                      ? 'bg-[#8B5E3C] text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  Client Visit
                </button>
              </div>
            </div>

            {newRecord.workLocationType === 'client_visit' && (
              <>
                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 mb-1 tracking-wide ${dmSans.className}`}
                  >
                    Client Name *
                  </label>
                  <input
                    className={`border w-full px-3 py-2 rounded tracking-wide ${dmSans.className}`}
                    value={newRecord.clientName || ''}
                    onChange={(e) =>
                      setNewRecord((prev) => ({ ...prev, clientName: e.target.value }))
                    }
                    required
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 mb-1 tracking-wide ${dmSans.className}`}
                  >
                    Client Location *
                  </label>
                  <input
                    className={`border w-full px-3 py-2 rounded tracking-wide ${dmSans.className}`}
                    value={newRecord.clientLocation || ''}
                    onChange={(e) =>
                      setNewRecord((prev) => ({ ...prev, clientLocation: e.target.value }))
                    }
                    required
                    placeholder="Enter client location"
                  />
                </div>
              </>
            )}

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 tracking-wide ${dmSans.className}`}>
                Check In Time
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  className={`border w-full px-3 py-2 rounded bg-gray-100 tracking-wide ${dmSans.className}`}
                  value={newRecord.checkIn || ''}
                  readOnly
                />
                <button
                  type="button"
                  onClick={updateCurrentTime}
                  className={`bg-gray-200 hover:bg-gray-300 px-3 rounded tracking-wide ${dmSans.className}`}
                >
                  Now
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Summary of Work Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className={`block text-sm font-medium text-gray-700 tracking-wide ${dmSans.className}`}>
                Summary of Work Done / Visits *
              </label>
              <div className="flex items-center">
                <span className={`text-xs text-gray-500 mr-2 tracking-wide ${dmSans.className}`}>
                  {newRecord.summaryOfWork?.length || 0}/500
                </span>
              </div>
            </div>
            
            <textarea
              className={`border w-full rounded p-2 tracking-wide ${dmSans.className}`}
              value={newRecord.summaryOfWork || ''}
              onChange={(e) =>
                setNewRecord((prev) => ({ ...prev, summaryOfWork: e.target.value }))
              }
              rows={5}
              required
              minLength={50}
            />
          </div>

          {/* Enhanced Follow-ups Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className={`block text-sm font-medium text-gray-700 tracking-wide ${dmSans.className}`}>
                Follow-ups Planned for Next Day *
              </label>
              <div className="flex items-center">
                <span className={`text-xs text-gray-500 mr-2 tracking-wide ${dmSans.className}`}>
                  {newRecord.followUps?.length || 0}/300
                </span>
              </div>
            </div>
            
            <textarea
              className={`border w-full rounded p-2 tracking-wide ${dmSans.className}`}
              value={newRecord.followUps || ''}
              onChange={(e) => setNewRecord((prev) => ({ ...prev, followUps: e.target.value }))}
              rows={4}
              required
              minLength={30}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-[#8B5E3C] text-white px-6 py-3 rounded-lg tracking-wide ${dmSans.className} disabled:opacity-50`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Sales Log'}
            </button>
          </div>
        </form>

        {/* Recent Attendance Records */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-semibold text-[#8B5E3C] tracking-wide ${dmSans.className}`}>
              Attendance Logs
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleTimeFilterChange('today')}
                className={`px-3 py-1 rounded tracking-wide ${dmSans.className} ${
                  timeFilter === 'today' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleTimeFilterChange('week')}
                className={`px-3 py-1 rounded tracking-wide ${dmSans.className} ${
                  timeFilter === 'week' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-200'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => handleTimeFilterChange('month')}
                className={`px-3 py-1 rounded tracking-wide ${dmSans.className} ${
                  timeFilter === 'month' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-200'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => handleTimeFilterChange('year')}
                className={`px-3 py-1 rounded tracking-wide ${dmSans.className} ${
                  timeFilter === 'year' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-200'
                }`}
              >
                This Year
              </button>
              <button
                onClick={() => handleTimeFilterChange('all')}
                className={`px-3 py-1 rounded tracking-wide ${dmSans.className} ${
                  timeFilter === 'all' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-200'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {loadingAttendance ? (
            <p className={`text-gray-500 tracking-wide ${dmSans.className}`}>Loading records...</p>
          ) : filteredList.length === 0 ? (
            <p className={`text-gray-500 tracking-wide ${dmSans.className}`}>No records found for selected period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm">
                <thead className="bg-[#8B5E3C] text-white">
                  <tr>
                    <th className={`p-2 text-left tracking-wider ${dmSans.className}`}>Date</th>
                    <th className={`p-2 text-left tracking-wider ${dmSans.className}`}>Location Type</th>
                    <th className={`p-2 text-left tracking-wider ${dmSans.className}`}>Client</th>
                    <th className={`p-2 text-left tracking-wider ${dmSans.className}`}>Check-in</th>
                    <th className={`p-2 text-left tracking-wider ${dmSans.className}`}>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.slice(0, 5).map((record) => (
                    <tr key={record._id} className="border-b hover:bg-gray-100">
                      <td className={`p-2 tracking-wide ${dmSans.className}`}>{record.date}</td>
                      <td className={`p-2 capitalize tracking-wider ${dmSans.className}`}>{record.workLocationType || '-'}</td>
                      <td className={`p-2 tracking-wider ${dmSans.className}`}>{record.clientName || '-'}</td>
                      <td className={`p-2 tracking-wider ${dmSans.className}`}>
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className={`p-2 max-w-xs truncate tracking-wide ${dmSans.className}`}>
                        {record.summaryOfWork || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className={`bg-red-100 text-red-700 p-3 rounded tracking-wide ${dmSans.className}`}>{error}</div>
        )}
        {success && (
          <div className={`bg-green-100 text-green-700 p-3 rounded tracking-wide ${dmSans.className}`}>
            {success}
          </div>
        )}
      </main>
    </div>
    </ProtectedRoute>
  )
}