'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DM_Sans } from 'next/font/google';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { FaBorderAll, FaUserClock } from "react-icons/fa";
import { IoIosContacts } from "react-icons/io";
// import { RiStore2Line } from "react-icons/ri";
// import { MdAdminPanelSettings } from "react-icons/md";
import { GrDocumentStore } from "react-icons/gr";
import { SiStatuspal } from "react-icons/si";
import {
  HomeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image';

const dmsans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const Sidebar = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  // const [isAdminMode, setIsAdminMode] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // const toggleAdminMode = () => {
  //   setIsAdminMode(!isAdminMode)
  // }

  const isActive = (href: string) => pathname === href

  const navItemClasses = (href: string) =>
    `flex items-center p-3 rounded-lg transition-colors ${
      isActive(href) ? 'bg-[#8B5E3C] text-white' : 'hover:bg-gray-200 text-gray-700'
    }`

  return (
    <>
      {/* Menu Button - Visible on all screens */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-50 top-4 left-4 p-2 rounded-md text-[#8B5E3C] transition-all duration-300 ${
          isOpen ? 'left-[17rem]' : 'left-4'
        } ${dmsans.className}`}
      >
        {isOpen ? (
          <XMarkIcon className="h-10 w-10" />
        ) : (
          <Bars3Icon className="h-10 w-10"/>
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed z-40 w-64 h-screen bg-white text-black left-0 top-0 overflow-y-auto shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${dmsans.className} hide-scrollbar flex flex-col`}
      >
        {/* Company Logo/Header */}
<div className="p-4 border-b border-gray-200 flex items-center justify-center">
  <Image
    src="/logo.png"
    alt="VoltEdge Logo"
    width={64}        // From your original code
    height={64}       // From your original code
    priority          // Added for better loading
    unoptimized       // Added to prevent blur
    className="h-16 w-auto"  // From your original code
  />
</div>

        {/* Admin Mode Toggle
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={toggleAdminMode}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              isAdminMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <MdAdminPanelSettings className="h-5 w-5 mr-2" />
              <span className="font-medium">Admin Mode</span>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                checked={isAdminMode}
                onChange={toggleAdminMode}
                className="hidden"
                id="admin-toggle"
              />
              <label 
                htmlFor="admin-toggle" 
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  isAdminMode ? 'bg-white' : 'bg-gray-300'
                }`}
              >
                <span 
                  className={`block h-6 w-6 rounded-full transform transition-transform duration-200 ease-in-out ${
                    isAdminMode ? 'translate-x-4 bg-orange-400' : 'translate-x-0 bg-white'
                  }`}
                />
              </label>
            </div>
          </button>
        </div> */}

        {/* Main Navigation */}
        <nav className="p-4 space-y-1 flex-grow">
          <Link href="/Aziz-Ahmed/Dashboard" className={`${navItemClasses('/Aziz-Ahmed/Dashboard')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <HomeIcon className="h-5 w-5 mr-3" />
            <span>Dashboard</span>
          </Link>

          <Link href="/Aziz-Ahmed/Quotations" className={`${navItemClasses('/Aziz-Ahmed/Quotations')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <DocumentTextIcon className="h-5 w-5 mr-3" />
            <span>Quotations</span>
          </Link>

          <Link href="/Aziz-Ahmed/Contacts" className={`${navItemClasses('/Aziz-Ahmed/Contacts')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <IoIosContacts className="h-5 w-5 mr-3" />
            <span>Contacts</span>
          </Link>

          <Link href="/Aziz-Ahmed/Work-Orders" className={`${navItemClasses('/Aziz-Ahmed/Work-Orders')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <FaBorderAll className="h-5 w-5 mr-3" />
            <span>Work Orders</span>
          </Link>
        
          <Link
            href="/Aziz-Ahmed/Work-Order-Status"
            className={`${navItemClasses('/Aziz-Ahmed/Work-Order-Status')} ${dmsans.className}`}
            onClick={() => setIsOpen(false)}
          >
            <SiStatuspal className="h-5 w-5 mr-3" />
            <span>Work Order Status</span>
          </Link>

          <Link href="/Aziz-Ahmed/Visit-Log" className={`${navItemClasses('/Aziz-Ahmed/Visit-Log')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <FaUserClock className="h-5 w-5 mr-3" />
            <span> Visit Log</span>
          </Link>

          <Link href="/Aziz-Ahmed/Documents" className={`${navItemClasses('/Aziz-Ahmed/Documents')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <GrDocumentStore className="h-5 w-5 mr-3" />
            <span>Documents</span>
          </Link>
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-900 mt-auto">
          <p>System and Software generated by Muhammad Hassan Jaffer</p>
            {/* // <p className="mt-1 text-[#8B5E3C] font-medium">Admin Mode Active</p> */}
          
        </div>
      </div>

      {/* Overlay - Only shown when sidebar is open */}
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