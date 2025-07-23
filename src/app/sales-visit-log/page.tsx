'use client'

import { useState, useEffect, useCallback } from 'react'
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Components/sidebar'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

interface Employee {
  name: string
}

interface Location {
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface Attendance {
  _id: string
  _createdAt: string
  employee: Employee
  date: string
  workLocationType?: 'office' | 'remote' | 'client_visit'
  clientName?: string
  clientLocation?: string
  checkIn?: string
  location?: Location
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
  location?: Location
  summaryOfWork?: string
  followUps?: string
  notes?: string
}

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newRecord, setNewRecord] = useState<NewAttendance>({
    employee: { name: '' },
    date: new Date().toISOString().split('T')[0],
    checkIn: new Date().toTimeString().slice(0, 5),
    workLocationType: 'office'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Work location color mapping
  const locationTypeColors: Record<string, string> = {
    office: 'bg-purple-100 text-purple-700',
    remote: 'bg-indigo-100 text-indigo-700',
    client_visit: 'bg-teal-100 text-teal-700',
  }

  // Fetch attendance records
  const fetchAttendance = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const query = `
        *[_type == "attendance"]{
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
        } | order(date desc, _createdAt desc)
      `
      const data = await client.fetch<Attendance[]>(query)
      setRecords(data)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load attendance records.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  // Update current time function
  const updateCurrentTime = () => {
    const now = new Date()
    setNewRecord(prev => ({
      ...prev,
      checkIn: now.toTimeString().slice(0, 5),
      date: now.toISOString().split('T')[0]
    }))
  }

  // Toggle form visibility and update time
  const toggleForm = () => {
    updateCurrentTime()
    setShowForm(prev => !prev)
    setSuccess(null) // Clear success message when toggling form
  }

  // Handle work location type change
  const handleWorkLocationChange = (type: 'office' | 'remote' | 'client_visit') => {
    setNewRecord(prev => ({
      ...prev,
      workLocationType: type,
      clientName: type === 'client_visit' ? prev.clientName : undefined,
      clientLocation: type === 'client_visit' ? prev.clientLocation : undefined
    }))
  }

  // Secretly get user location when form is shown
  useEffect(() => {
    if (showForm) {
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

          setNewRecord(prev => ({
            ...prev,
            location: {
              address,
              coordinates: { lat: latitude, lng: longitude }
            }
          }))
        } catch (err) {
          console.error('Location error', err)
        }
      }

      getLocation()
    }
  }, [showForm])

  // Submit attendance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Validate employee name
      if (!newRecord.employee.name.trim()) {
        throw new Error('Employee name is required')
      }

      // Format checkIn time with current date
      const checkInTime = newRecord.checkIn
        ? new Date(`${newRecord.date}T${newRecord.checkIn}`).toISOString()
        : new Date().toISOString()

      const doc = {
        _type: 'attendance',
        employee: {
          name: newRecord.employee.name.trim()
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
        verified: false
      }

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create attendance')
      }

      const createdDoc = await res.json()

      setRecords(prev => [
        { ...createdDoc, _createdAt: new Date().toISOString() } as Attendance,
        ...prev
      ])

      // Set success message
      setSuccess(`Attendance record for ${newRecord.employee.name.trim()} created successfully!`)

      // Reset form with empty employee name but keep other defaults
      setNewRecord({
        employee: { name: '' },
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toTimeString().slice(0, 5),
        workLocationType: 'office'
      })
      
      // Auto-hide form after 3 seconds
      setTimeout(() => {
        setShowForm(false)
      }, 3000)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clear all attendance records
  const handleClearAllRecords = async () => {
    if (!confirm('Are you sure you want to delete ALL attendance records? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(null)
    setSuccess(null)
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete records')
      }

      setRecords([])
      setSuccess('All attendance records deleted successfully!')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to delete records')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredRecords = records.filter(r => {
    const term = searchTerm.toLowerCase()
    return (
      r.employee.name.toLowerCase().includes(term) ||
      r.date.toLowerCase().includes(term) ||
      (r.workLocationType?.toLowerCase().includes(term) ?? false) ||
      (r.location?.address?.toLowerCase().includes(term) ?? false) ||
      (r.clientName?.toLowerCase().includes(term) ?? false) ||
      (r.clientLocation?.toLowerCase().includes(term) ?? false) ||
      (r.summaryOfWork?.toLowerCase().includes(term) ?? false) ||
      (r.followUps?.toLowerCase().includes(term) ?? false) ||
      (r.notes?.toLowerCase().includes(term) ?? false)
    )
  })

  return (
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <Sidebar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b pb-6">
          <div className="space-y-2">
            <h1 className={`text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
              Sales Visit Log
            </h1>
            <p className={`text-gray-600 ${dmSans.className}`}>
              {filteredRecords.length} records {searchTerm && `matching "${searchTerm}"`}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={toggleForm}
              className={`bg-[#8B5E3C] text-white px-4 py-2 rounded ${dmSans.className}`}
            >
              {showForm ? 'Cancel' : 'Add Record'}
            </button>
            {records.length > 0 && (
              <button
                onClick={handleClearAllRecords}
                disabled={isDeleting}
                className={`bg-red-600 text-white px-4 py-2 rounded ${dmSans.className} disabled:opacity-50`}
              >
                {isDeleting ? 'Deleting...' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={`bg-red-100 text-red-700 p-3 rounded ${dmSans.className}`}>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className={`bg-green-100 text-green-700 p-3 rounded ${dmSans.className}`}>
            {success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
            <h2 className={`text-2xl font-semibold text-[#8B5E3C] ${dmSans.className}`}>
              Add Sales Visit Log
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                  Employee Name *
                </label>
                <input
                  className={`border w-full px-3 py-2 rounded ${dmSans.className}`}
                  value={newRecord.employee.name}
                  onChange={e =>
                    setNewRecord(prev => ({
                      ...prev,
                      employee: { ...prev.employee, name: e.target.value }
                    }))
                  }
                  required
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                  Date <span className="text-xs text-gray-500">(auto-generated)</span>
                </label>
                <input
                  type="date"
                  className={`border w-full px-3 py-2 rounded bg-gray-100 ${dmSans.className}`}
                  value={newRecord.date}
                  readOnly
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                  Work Location Type *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleWorkLocationChange('office')}
                    className={`px-3 py-1 rounded ${newRecord.workLocationType === 'office' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-200'}`}
                  >
                    Office
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWorkLocationChange('remote')}
                    className={`px-3 py-1 rounded ${newRecord.workLocationType === 'remote' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-200'}`}
                  >
                    Remote
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWorkLocationChange('client_visit')}
                    className={`px-3 py-1 rounded ${newRecord.workLocationType === 'client_visit' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-200'}`}
                  >
                    Client Visit
                  </button>
                </div>
              </div>
              {newRecord.workLocationType === 'client_visit' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                      Client Name *
                    </label>
                    <input
                      className={`border w-full px-3 py-2 rounded ${dmSans.className}`}
                      value={newRecord.clientName || ''}
                      onChange={e => setNewRecord(prev => ({ ...prev, clientName: e.target.value }))}
                      required
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                      Client Location *
                    </label>
                    <input
                      className={`border w-full px-3 py-2 rounded ${dmSans.className}`}
                      value={newRecord.clientLocation || ''}
                      onChange={e => setNewRecord(prev => ({ ...prev, clientLocation: e.target.value }))}
                      required
                      placeholder="Enter client location"
                    />
                  </div>
                </>
              )}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                  Check In Time <span className="text-xs text-gray-500">(auto-generated)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    className={`border w-full px-3 py-2 rounded bg-gray-100 ${dmSans.className}`}
                    value={newRecord.checkIn || ''}
                    readOnly
                    required
                  />
                  <button
                    type="button"
                    onClick={updateCurrentTime}
                    className="bg-gray-200 hover:bg-gray-300 px-3 rounded"
                  >
                    Now
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                Summary of Work Done / Visits
              </label>
              <textarea
                className={`border w-full rounded p-2 ${dmSans.className}`}
                value={newRecord.summaryOfWork || ''}
                onChange={e => setNewRecord(prev => ({ ...prev, summaryOfWork: e.target.value }))}
                rows={3}
                placeholder="Brief summary of work completed today..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                Follow-ups Planned for Next Day
              </label>
              <textarea
                className={`border w-full rounded p-2 ${dmSans.className}`}
                value={newRecord.followUps || ''}
                onChange={e => setNewRecord(prev => ({ ...prev, followUps: e.target.value }))}
                rows={2}
                placeholder="Any follow-up tasks planned for tomorrow..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${dmSans.className}`}>
                Additional Notes
              </label>
              <textarea
                className={`border w-full rounded p-2 ${dmSans.className}`}
                value={newRecord.notes || ''}
                onChange={e => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                placeholder="Any additional notes or comments..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-[#8B5E3C] text-white px-6 py-3 rounded-lg ${dmSans.className} disabled:opacity-50`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </form>
        )}

        {/* Records Table */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 pb-4">
            <h2 className={`text-2xl font-semibold text-[#8B5E3C] ${dmSans.className}`}>
              Sales Visit Log
            </h2>
            <div className="relative w-64">
              <input
                type="text"
                className={`border rounded px-4 py-2 w-full ${dmSans.className} pl-10`}
                placeholder="Search logs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <p className={`text-gray-600 ${dmSans.className}`}>Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-6 text-center">
              <p className={`text-gray-600 ${dmSans.className}`}>
                {searchTerm ? 'No matching records found' : 'No attendance records available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Work Location</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Check In</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Client Details</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Work Summary</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Follow-ups</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map(rec => (
                    <tr key={rec._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{rec.employee.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(rec.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {rec.workLocationType && (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${locationTypeColors[rec.workLocationType] || 'bg-gray-100 text-gray-800'}`}>
                            {rec.workLocationType === 'office' ? 'Office' : 
                             rec.workLocationType === 'remote' ? 'Remote' : 'Client Visit'}
                          </span>
                        )}
                        {rec.location?.address && (
                          <div className="mt-1 text-xs text-gray-500">
                            <a
                              href={`https://maps.google.com?q=${rec.location.coordinates?.lat},${rec.location.coordinates?.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {rec.location.address.slice(0, 20)}...
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {rec.workLocationType === 'client_visit' ? (
                          <>
                            <div className="font-medium">{rec.clientName || '—'}</div>
                            <div className="text-sm text-gray-500">{rec.clientLocation || '—'}</div>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {rec.summaryOfWork ? (
                          <details>
                            <summary className="cursor-pointer text-blue-600">View Summary</summary>
                            <p className="mt-1 text-gray-700">{rec.summaryOfWork}</p>
                          </details>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {rec.followUps ? (
                          <details>
                            <summary className="cursor-pointer text-blue-600">View Follow-ups</summary>
                            <p className="mt-1 text-gray-700">{rec.followUps}</p>
                          </details>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}