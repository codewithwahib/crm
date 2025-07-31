'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DM_Sans } from 'next/font/google'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { IoSettings } from "react-icons/io5"
import { SiStatuspal } from "react-icons/si"
import { HiOutlineLogout } from "react-icons/hi"
import Image from 'next/image'

const dmsans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  const isActive = (href: string) => pathname === href

  const navItemClasses = (href: string) =>
    `flex items-center p-3 rounded-lg transition-colors ${
      isActive(href) ? 'bg-[#8B5E3C] text-white' : 'hover:bg-gray-200 text-gray-700'
    }`

  const confirmLogout = () => {
    // If using NextAuth, you would use:
    // await signOut({ callbackUrl: "/login" })
    
    // For localStorage-based auth:
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-50 top-4 left-4 p-2 rounded-md text-[#8B5E3C] transition-all duration-300 ${
          isOpen ? 'left-[17rem]' : 'left-4'
        } ${dmsans.className}`}
      >
        {isOpen ? <XMarkIcon className="h-10 w-10" /> : <Bars3Icon className="h-10 w-10"/>}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed z-40 w-64 h-screen bg-white text-black left-0 top-0 overflow-y-auto shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${dmsans.className} hide-scrollbar flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="VoltEdge Logo"
            width={64}
            height={64}
            priority
            unoptimized
            className="h-16 w-auto"
          />
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1 flex-grow">
          <Link
            href="/Mechanical/work-orders-status"
            className={`${navItemClasses('/Mechanical/work-orders-status')} ${dmsans.className}`}
            onClick={() => setIsOpen(false)}
          >
            <SiStatuspal className="h-5 w-5 mr-3" />
            <span>Work Order Status</span>
          </Link>

          <Link 
            href="/Mechanical/drawings" 
            className={`${navItemClasses('/Mechanical/drawings')} ${dmsans.className}`} 
            onClick={() => setIsOpen(false)}
          >
            <IoSettings className="h-7 w-7 mr-3" />
            <span className='text-md tracking-wider'>Drawing/Components</span>
          </Link>
        </nav>

        {/* Logout Button & Footer */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center p-3 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
          >
            <HiOutlineLogout className="h-5 w-5 mr-2" />
            <span className="font-medium">Logout</span>
          </button>

          <p className="text-gray-500 text-[11px] text-center">
            System and Software by <br /> Muhammad Hassan Jaffer
          </p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl space-y-4 text-center">
            <h2 className={`text-lg font-semibold text-gray-800 ${dmsans.className}`}>
              Confirm Logout
            </h2>
            <p className={`text-sm text-gray-600 ${dmsans.className}`}>
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={confirmLogout}
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition ${dmsans.className}`}
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition ${dmsans.className}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}

export default Sidebar