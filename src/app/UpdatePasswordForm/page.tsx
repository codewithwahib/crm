'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DM_Sans } from 'next/font/google';
import { FaEye, FaEyeSlash, FaLock, FaArrowLeft } from 'react-icons/fa';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function UpdatePassword() {
  const router = useRouter();
  const [formData, setFormData] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [status, setStatus] = useState({
    loading: false,
    error: '',
    success: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (formData.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const username = localStorage.getItem('user');
      if (!username) throw new Error('Session expired. Please login again.');

      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      setStatus({
        loading: false,
        error: '',
        success: 'Password updated successfully! Redirecting...'
      });

      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setStatus({
        loading: false,
        error: err.message,
        success: ''
      });
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${dmSans.className}`}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-[#8B5E3C] mb-4"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        <div className="flex justify-center mb-6">
          <div className="bg-[#8B5E3C] p-3 rounded-full">
            <FaLock className="text-2xl text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Update Password</h1>
        
        {status.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {status.error}
          </div>
        )}
        
        {status.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
            {status.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['current', 'new', 'confirm'] as const).map((field) => (
            <div key={field} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field === 'current' ? 'Current Password' : 
                 field === 'new' ? 'New Password' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPasswords[field] ? 'text' : 'password'}
                  name={`${field}Password`}
                  value={formData[`${field}Password`]}
                  onChange={(e) => setFormData({
                    ...formData,
                    [`${field}Password`]: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                  required
                  minLength={field !== 'current' ? 8 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({
                    ...showPasswords,
                    [field]: !showPasswords[field]
                  })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#8B5E3C]"
                >
                  {showPasswords[field] ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={status.loading}
            className={`w-full py-3 px-4 bg-[#8B5E3C] text-white rounded-md hover:bg-[#6F4A2F] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] transition-colors ${
              status.loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {status.loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}