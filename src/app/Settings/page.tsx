'use client'

import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Components/sidebar'
import ProtectedRoute from '@/app/Components/ProtectedRoute'
import { Eye, EyeOff } from 'lucide-react'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

const roles = [
  { label: 'Director', value: 'director' },
  { label: 'GM Sales', value: 'gm-sales' },
  { label: 'Sales Manager', value: 'sales-manager' },
  { label: 'Execution', value: 'execution' },
  { label: 'Mechanical', value: 'mechanical' },
  { label: 'Store', value: 'store' },
]

export default function UpdatePasswordPage() {
  const [role, setRole] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validate passwords whenever they change
  useEffect(() => {
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match')
      } else if (newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters')
      } else {
        setPasswordError('')
      }
    } else {
      setPasswordError('')
    }
  }, [newPassword, confirmPassword])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Final validation check
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      toast.error('Passwords do not match', {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#b91c1c',
          padding: '16px',
          borderRadius: '8px',
          fontWeight: 500,
        },
      })
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      toast.error('Password must be at least 6 characters', {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#b91c1c',
          padding: '16px',
          borderRadius: '8px',
          fontWeight: 500,
        },
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, password: newPassword }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password')

      toast.success(`Password updated for ${role}`, {
        duration: 4000,
        position: 'top-center',
        icon: '✅',
        style: {
          background: '#f0fdf4',
          color: '#166534',
          padding: '16px',
          borderRadius: '8px',
          fontWeight: 500,
        },
      })
      
      setNewPassword('')
      setConfirmPassword('')
      setRole('')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password'
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#b91c1c',
          padding: '16px',
          borderRadius: '8px',
          fontWeight: 500,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedUser="director">
      <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
        <Toaster />
        <Sidebar />
        <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
          <div className="flex justify-between items-start pb-4">
            <div className="space-y-1">
              <h1 className={`text-2xl font-bold pt-12 pl-4 text-[#8B5E3C] ${dmSans.className}`}>
                {/* Update Role Password */}
              </h1>
              <p className="text-sm text-gray-500 pl-4">
                {/* Update authentication credentials for system roles */}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="mt-6 space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
              <h2 className={`text-lg font-semibold text-[#8B5E3C] mb-4 pb-2 border-b ${dmSans.className}`}>
             Change Password 
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                    Select Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                  >
                    <option value="">Select a role</option>
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${dmSans.className}`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <label className={`block text-sm font-medium mb-1 ${dmSans.className}`}>
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                      passwordError ? 'border-red-500 focus:ring-red-200' : 'focus:ring-[#8B5E3C]'
                    } ${dmSans.className}`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setRole('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className={`px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${dmSans.className}`}
                disabled={loading}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading || !!passwordError}
                className={`px-3 py-1.5 text-sm rounded-md bg-[#8B5E3C] text-white hover:bg-[#6d4a2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${dmSans.className}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  )
}