// 'use client'

// import { useEffect, useState } from 'react'
// import { sanityClientSecond } from '@/sanity/lib/sanityClient'

// interface JobApplication {
//   _id: string
//   name: string
//   email: string
//   phone: string
//   company: string
//   city: string
//   jobTitle: string
//   comments: string
//   resumeUrl: string
//   submittedAt: string
// }

// export default function JobApplicationsPage() {
//   const [applications, setApplications] = useState<JobApplication[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const query = `*[_type == "jobApplication"] | order(_createdAt desc){
//           _id,
//           name,
//           email,
//           phone,
//           company,
//           city,
//           jobTitle,
//           comments,
//           resumeUrl,
//           submittedAt
//         }`
//         const data = await sanityClientSecond.fetch(query)
//         console.log('Fetched applications:', data)
//         setApplications(data)
//       } catch (error) {
//         console.error('Error fetching job applications:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-3xl font-bold mb-6">Job Applications</h1>

//       {loading ? (
//         <p className="text-center text-gray-500">Loading...</p>
//       ) : applications.length === 0 ? (
//         <p className="text-center text-gray-500">No job applications found.</p>
//       ) : (
//         <div className="grid gap-4">
//           {applications.map((app) => (
//             <div key={app._id} className="bg-white p-4 rounded-lg shadow border">
//               <div className="flex justify-between items-center mb-2">
//                 <h2 className="text-xl font-semibold">{app.name}</h2>
//                 <span className="text-sm text-gray-500">
//                   {new Date(app.submittedAt).toLocaleDateString()}
//                 </span>
//               </div>
//               <p className="text-sm"><strong>Email:</strong> {app.email}</p>
//               <p className="text-sm"><strong>Phone:</strong> {app.phone}</p>
//               <p className="text-sm"><strong>Company:</strong> {app.company}</p>
//               <p className="text-sm"><strong>City:</strong> {app.city}</p>
//               <p className="text-sm"><strong>Job Title:</strong> {app.jobTitle}</p>
//               <p className="text-sm"><strong>Comments:</strong> {app.comments}</p>
//               <a
//                 href={app.resumeUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:underline text-sm mt-2 inline-block"
//               >
//                 📎 View Resume
//               </a>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }
