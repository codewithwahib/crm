'use client'
import { client } from '@/sanity/lib/client'
import { DM_Sans } from 'next/font/google'
import Sidebar from '@/app/Components/sidebar'
import { useState, useEffect } from 'react'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

interface Contact {
  _id: string
  name?: string
  email?: string
  phone?: string
  company?: string
  address?: string
  customerEmail?: string
  customerPhone?: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const query = `
          *[_type == "quotation"] {
            _id,
            name,
            customerEmail,
            customerPhone,
            company,
            address,
            client
          } | order(_createdAt desc)
        `
        const quotations: Contact[] = await client.fetch(query)
        
        const transformedContacts = quotations.map(quote => ({
          _id: quote._id,
          name: quote.name || quote.client || 'Unnamed Contact',
          email: quote.customerEmail || 'No email',
          phone: quote.customerPhone || 'No phone',
          company: quote.company || 'No company',
          address: quote.address || 'No address'
        }))
        
        setContacts(transformedContacts)
      } catch (error) {
        console.error('Error fetching contacts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase()
    return (
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.phone?.toLowerCase().includes(searchLower) ||
      contact.address?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className={`min-h-screen bg-white text-gray-800 ${dmSans.variable} font-sans`}>
      <Sidebar />
      <main className="lg:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b pb-6 gap-4">
          <div className="space-y-2 pt-12 pl-3">
            <h1 className={`text-2xl sm:text-3xl font-bold text-[#8B5E3C] ${dmSans.className}`}>
              Client Contacts
            </h1>
            <p className={`text-base sm:text-lg text-gray-600 ${dmSans.className}`}>
              {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'} found
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full md:w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts..."
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] outline-none transition ${dmSans.className}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search contacts"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5E3C]"></div>
          </div>
        ) : (
          <>
            {/* Contacts Table - Desktop */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y divide-gray-200 ${dmSans.className}`}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Contact Info</th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider">Address</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContacts.map((contact) => (
                      <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm sm:text-base font-medium text-gray-900">{contact.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm sm:text-base text-gray-600">{contact.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <a 
                              href={`mailto:${contact.email}`} 
                              className="text-sm sm:text-base text-[#8B5E3C] hover:underline hover:text-[#6d4a2f]"
                            >
                              {contact.email}
                            </a>
                            <a 
                              href={`tel:${contact.phone}`} 
                              className="text-sm sm:text-base text-[#8B5E3C] hover:underline hover:text-[#6d4a2f]"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm sm:text-base text-gray-600">{contact.address}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contacts Cards - Mobile */}
            <div className="md:hidden space-y-4">
              {filteredContacts.map((contact) => (
                <div key={contact._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-gray-600">{contact.company}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a 
                          href={`mailto:${contact.email}`} 
                          className="text-[#8B5E3C] hover:underline hover:text-[#6d4a2f]"
                        >
                          {contact.email}
                        </a>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a 
                          href={`tel:${contact.phone}`} 
                          className="text-[#8B5E3C] hover:underline hover:text-[#6d4a2f]"
                        >
                          {contact.phone}
                        </a>
                      </div>
                      
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-600">{contact.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredContacts.length === 0 && (
              <div className="text-center py-10 md:py-20">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {searchTerm ? 'No contacts found' : 'No client contacts'}
                </h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm
                    ? 'Try adjusting your search or filter to find what you\'re looking for.'
                    : 'No client contacts found in quotations.'}
                </p>
                {searchTerm && (
                  <div className="mt-6">
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#8B5E3C] hover:bg-[#6d4a2f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5E3C]"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}