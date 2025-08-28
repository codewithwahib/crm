// import { useRouter } from 'next/router';

// export default function LogoutButton() {
//   const router = useRouter();

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     router.push('/');
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//     >
//       Logout
//     </button>
//   );
// }

'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('user');
    
    // Trigger storage event to notify other tabs
    window.dispatchEvent(new Event('storage'));
    
    // Redirect to home
    router.push('/');
    router.refresh(); // Ensure the page updates
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
}