// 'use client'
// import Link from 'next/link'
// import { usePathname, useRouter } from 'next/navigation'
// import { DM_Sans } from 'next/font/google'
// import { useState } from 'react'
// import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
// import { RiStore2Line } from "react-icons/ri"
// import { MdAdminPanelSettings } from "react-icons/md"
// import { HiOutlineLogout } from "react-icons/hi"
// import Image from 'next/image'

// const dmsans = DM_Sans({ 
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
// })

// const Sidebar = () => {
//   const pathname = usePathname()
//   const router = useRouter()
//   const [isOpen, setIsOpen] = useState(false)
//   const [isAdminMode, setIsAdminMode] = useState(false)
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

//   const toggleSidebar = () => setIsOpen(!isOpen)
//   const toggleAdminMode = () => setIsAdminMode(!isAdminMode)
//   const isActive = (href: string) => pathname === href

//   const navItemClasses = (href: string) =>
//     `flex items-center p-3 rounded-lg transition-colors ${
//       isActive(href) ? 'bg-[#8B5E3C] text-white' : 'hover:bg-gray-200 text-gray-700'
//     }`

//   const confirmLogout = () => {
//     localStorage.removeItem('user')
//     router.push('/')
//   }

//   return (
//     <>
//       {/* Menu Button */}
//       <button
//         onClick={toggleSidebar}
//         className={`fixed z-50 top-4 left-4 p-2 rounded-md text-[#8B5E3C] transition-all duration-300 ${
//           isOpen ? 'left-[17rem]' : 'left-4'
//         } ${dmsans.className}`}
//       >
//         {isOpen ? <XMarkIcon className="h-10 w-10" /> : <Bars3Icon className="h-10 w-10"/>}
//       </button>

//       {/* Sidebar */}
//       <div
//         className={`fixed z-40 w-64 h-screen bg-white text-black left-0 top-0 overflow-y-auto shadow-lg transition-all duration-300 ease-in-out ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } ${dmsans.className} hide-scrollbar flex flex-col`}
//       >
//         {/* Logo */}
//         <div className="p-4 border-b border-gray-200 flex items-center justify-center">
//           <Image
//             src="/logo.png"
//             alt="VoltEdge Logo"
//             width={64}
//             height={64}
//             priority
//             unoptimized
//             className="h-16 w-auto"
//           />
//         </div>

//         {/* Admin Mode Toggle */}
//         <div className="p-4 border-b border-gray-200">
//           <button onClick={toggleAdminMode} className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isAdminMode ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>
//             <div className="flex items-center">
//               <MdAdminPanelSettings className="h-5 w-5 mr-2" />
//               <span className="font-medium">Admin Mode</span>
//             </div>
//             <div className="relative inline-block w-10 mr-2 align-middle select-none">
//               <input type="checkbox" checked={isAdminMode} onChange={toggleAdminMode} className="hidden" id="admin-toggle" />
//               <label htmlFor="admin-toggle" className={`block overflow-hidden h-6 rounded-full cursor-pointer ${isAdminMode ? 'bg-gray-300' : 'bg-gray-300'}`}>
//                 <span className={`block h-6 w-6 rounded-full transform transition-transform duration-200 ease-in-out ${isAdminMode ? 'translate-x-4 bg-blue-400' : 'translate-x-0 bg-gray-100'}`} />
//               </label>
//             </div>
//           </button>
//         </div>

//         {/* Main Navigation */}
//         <nav className="p-4 space-y-1 flex-grow">
//           <Link href="/Store/inventory" className={`${navItemClasses('/Store/inventory')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
//             <RiStore2Line className="h-5 w-5 mr-3" />
//             <span>Inventory</span>
//           </Link>

//           {/* Admin-only links */}
//           {isAdminMode && (
//             <div className="pt-4 mt-4 border-t border-gray-200">
//               <p className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                 Admin Panel
//               </p>
//               <Link 
//   href="Store/inventory/add" 
//   className={`${navItemClasses('/inventory/add')} ${dmsans.className}`} 
//   onClick={() => setIsOpen(false)}
// >
//   <RiStore2Line className="h-5 w-5 mr-3" />
//   <span>Manage Inventory</span>
// </Link>
//             </div>
//           )}
//         </nav>

//         {/* Logout Button */}
//         <div className="p-4 border-t border-gray-200">
//           <button 
//             onClick={() => setShowLogoutConfirm(true)}
//             className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
//           >
//             <HiOutlineLogout className="h-5 w-5 mr-3" />
//             <span className="font-medium">Logout</span>
//           </button>
//         </div>

//         {/* Footer Section */}
//         <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-900">
//           <p>System and Software generated by Muhammad Hassan Jaffer</p>
//           {isAdminMode && (
//             <p className="mt-1 text-blue-400 font-medium">Admin Mode Active</p>
//           )}
//         </div>
//       </div>

//       {/* Overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30"
//           onClick={toggleSidebar}
//         />
//       )}

//       {/* Logout Confirmation Dialog */}
//       {showLogoutConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-80 shadow-xl space-y-4 text-center">
//             <h2 className={`text-lg font-semibold text-gray-800 ${dmsans.className}`}>
//               Confirm Logout
//             </h2>
//             <p className={`text-sm text-gray-600 ${dmsans.className}`}>
//               Are you sure you want to log out?
//             </p>
//             <div className="flex justify-center gap-3 pt-2">
//               <button
//                 onClick={confirmLogout}
//                 className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition ${dmsans.className}`}
//               >
//                 Logout
//               </button>
//               <button
//                 onClick={() => setShowLogoutConfirm(false)}
//                 className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition ${dmsans.className}`}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx global>{`
//         .hide-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .hide-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </>
//   )
// }

// export default Sidebar


'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DM_Sans } from 'next/font/google'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { RiStore2Line } from "react-icons/ri"
import { MdAdminPanelSettings } from "react-icons/md"
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
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)
  const toggleAdminMode = () => setIsAdminMode(!isAdminMode)
  const isActive = (href: string) => pathname === href

  const navItemClasses = (href: string) =>
    `flex items-center p-3 rounded-lg transition-colors ${
      isActive(href) ? 'bg-[#8B5E3C] text-white' : 'hover:bg-gray-200 text-gray-700'
    }`

  const confirmLogout = () => {
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

        {/* Admin Mode Toggle */}
        <div className="p-4 border-b border-gray-200">
          <button onClick={toggleAdminMode} className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isAdminMode ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>
            <div className="flex items-center">
              <MdAdminPanelSettings className="h-5 w-5 mr-2" />
              <span className="font-medium">Admin Mode</span>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input type="checkbox" checked={isAdminMode} onChange={toggleAdminMode} className="hidden" id="admin-toggle" />
              <label htmlFor="admin-toggle" className={`block overflow-hidden h-6 rounded-full cursor-pointer ${isAdminMode ? 'bg-gray-300' : 'bg-gray-300'}`}>
                <span className={`block h-6 w-6 rounded-full transform transition-transform duration-200 ease-in-out ${isAdminMode ? 'translate-x-4 bg-blue-400' : 'translate-x-0 bg-gray-100'}`} />
              </label>
            </div>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1 flex-grow">
          <Link href="/Store/inventory" className={`${navItemClasses('/Store/inventory')} ${dmsans.className}`} onClick={() => setIsOpen(false)}>
            <RiStore2Line className="h-5 w-5 mr-3" />
            <span>Inventory</span>
          </Link>

          {/* Admin-only links */}
          {isAdminMode && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin Panel
              </p>
              <Link 
                href="/Store/inventory/add" 
                className={`${navItemClasses('/Store/inventory/add')} ${dmsans.className}`} 
                onClick={() => setIsOpen(false)}
              >
                <RiStore2Line className="h-5 w-5 mr-3" />
                <span>Manage Inventory</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
          >
            <HiOutlineLogout className="h-5 w-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-900">
          <p>System and Software generated by Muhammad Hassan Jaffer</p>
          {isAdminMode && (
            <p className="mt-1 text-blue-400 font-medium">Admin Mode Active</p>
          )}
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