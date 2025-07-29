'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DM_Sans } from 'next/font/google'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { IoSettings } from "react-icons/io5"
import { SiStatuspal } from "react-icons/si"
import Image from 'next/image'

// ✅ Import NextAuth signOut
// import { signOut } from "next-auth/react"

const dmsans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const Sidebar = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  const isActive = (href: string) => pathname === href

  const navItemClasses = (href: string) =>
    `flex items-center p-3 rounded-lg transition-colors ${
      isActive(href) ? 'bg-[#8B5E3C] text-white' : 'hover:bg-gray-200 text-gray-700'
    }`

  // const handleLogout = async () => {
  //   await signOut({ callbackUrl: "/login" })  // Redirect to login after logout
  // }

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

        {/* ✅ Logout Button & Footer */}
        <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-900 mt-auto space-y-3">
          {/* <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Logout
          </button> */}

          {/* <p className="text-gray-500 text-[11px]">
            System and Software by <br /> Muhammad Hassan Jaffer
          </p> */}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
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
