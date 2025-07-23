import Sidebar from '@/app/Anas-Nayyar/Components/sidebar'

export default function Home() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="ml-10 p-6 w-full">
        {/* <h1 className="text-2xl font-bold text-black">Welcome to Dashboard</h1> */}
        {/* Main content area - will have white background by default */}
        <div className="mt-4">
          {/* Your dashboard content goes here */}
        </div>
      </div>
    </div>
  )
}