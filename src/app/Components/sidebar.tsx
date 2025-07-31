// You asked to keep everything the same and just integrate a custom logout confirmation. Here's the full updated code:

'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DM_Sans } from 'next/font/google';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { FaBorderAll, FaUserClock } from "react-icons/fa";
import { IoIosContacts } from "react-icons/io";
import { RiStore2Line } from "react-icons/ri";
import { MdAdminPanelSettings } from "react-icons/md";
import { HiOutlineLogout } from "react-icons/hi";
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
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleAdminMode = () => setIsAdminMode(!isAdminMode);
  const isActive = (href: string) => pathname === href;
  const router = useRouter();

  const navItemClasses = (href: string) =>
    `flex items-center p-3 rounded-lg transition-colors ${
      isActive(href) ? 'bg-[#8B5E3C] text-white' : 'hover:bg-gray-200 text-gray-700'
    }`;

  const confirmLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <>
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

      <div className={`fixed z-40 w-64 h-screen bg-white text-black left-0 top-0 overflow-y-auto shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${dmsans.className} hide-scrollbar flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-center">
          <Image src="/logo.png" alt="VoltEdge Logo" width={64} height={64} priority unoptimized className="h-16 w-auto" />
        </div>

        <div className="p-4 border-b border-gray-200">
          <button onClick={toggleAdminMode} className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isAdminMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>
            <div className="flex items-center">
              <MdAdminPanelSettings className="h-5 w-5 mr-2" />
              <span className="font-medium">Admin Mode</span>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input type="checkbox" checked={isAdminMode} onChange={toggleAdminMode} className="hidden" id="admin-toggle" />
              <label htmlFor="admin-toggle" className={`block overflow-hidden h-6 rounded-full cursor-pointer ${isAdminMode ? 'bg-white' : 'bg-gray-300'}`}>
                <span className={`block h-6 w-6 rounded-full transform transition-transform duration-200 ease-in-out ${isAdminMode ? 'translate-x-4 bg-orange-400' : 'translate-x-0 bg-white'}`} />
              </label>
            </div>
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-grow">
          <Link href="/dashboard" className={`${navItemClasses('/dashboard')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <HomeIcon className="h-5 w-5 mr-3" />
            <span>Dashboard</span>
          </Link>

          <Link href="/quotation" className={`${navItemClasses('/quotations')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <DocumentTextIcon className="h-5 w-5 mr-3" />
            <span>Quotations</span>
          </Link>

          <Link href="/contacts" className={`${navItemClasses('/contacts')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <IoIosContacts className="h-5 w-5 mr-3" />
            <span>Contacts</span>
          </Link>

          <Link href="/work-orders" className={`${navItemClasses('/work-orders')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <FaBorderAll className="h-5 w-5 mr-3" />
            <span>Work Orders</span>
          </Link>

          <Link href="/work-orders-status" className={`${navItemClasses('/work-orders-status')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <SiStatuspal className="h-5 w-5 mr-3" />
            <span>Work Order Status</span>
          </Link>

          <Link href="/sales-visit-log" className={`${navItemClasses('/sales-visit-log')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <FaUserClock className="h-5 w-5 mr-3" />
            <span>Sales Visit Log</span>
          </Link>

          <Link href="/documents" className={`${navItemClasses('/documents')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <GrDocumentStore className="h-5 w-5 mr-3" />
            <span>Documents</span>
          </Link>

          <Link href="/inventory" className={`${navItemClasses('/inventory')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <RiStore2Line className="h-5 w-5 mr-3" />
            <span>Inventory</span>
          </Link>

          {isAdminMode && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Panel</p>
              <Link href="/quotation/add" className={`${navItemClasses('/quotation/add')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
                <DocumentTextIcon className="h-5 w-5 mr-3" />
                <span>Manage Quotations</span>
              </Link>
              <Link href="/work-orders/add" className={`${navItemClasses('/work-orders/add')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
                <FaBorderAll className="h-5 w-5 mr-3" />
                <span>Manage Work Orders</span>
              </Link>
              <Link href="/inventory/add" className={`${navItemClasses('/inventory/add')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
                <RiStore2Line className="h-5 w-5 mr-3" />
                <span>Manage Inventory</span>
              </Link>
              <Link href="/documents/add" className={`${navItemClasses('/documents/add')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
                <FaBorderAll className="h-5 w-5 mr-3" />
                <span>Manage Documents</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center tracking-wide p-3 rounded-lg text-red-700 hover:bg-red-200 transition-colors">
            <HiOutlineLogout className="h-5 w-5 mr-3" />
            <span className={`font-medium ${dmsans.className}`}>Logout</span>
          </button>
        </div>

        <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-900">
          <p>System and Software generated by Muhammad Hassan Jaffer</p>
          {isAdminMode && <p className="mt-1 text-[#8B5E3C] font-medium">Admin Mode Active</p>}
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleSidebar} />}

      {showLogoutConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-96 shadow-lg space-y-4 text-center">
      <h2 className={`text-lg font-semibold text-gray-800 tracking-wide ${dmsans.className}`}>
        Confirm Logout
      </h2>
      <p className={`text-sm text-gray-600 tracking-wide ${dmsans.className}`}>
        Are you sure you want to log out of your account?
      </p>
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={confirmLogout}
          className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition tracking-wide ${dmsans.className}`}
        >
          Yes, Logout
        </button>
        <button
          onClick={() => setShowLogoutConfirm(false)}
          className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition tracking-wide ${dmsans.className}`}
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
};

export default Sidebar;
