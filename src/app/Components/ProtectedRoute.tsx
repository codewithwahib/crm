// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { DM_Sans } from 'next/font/google';

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-dm-sans',
// });

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   allowedUser: string;
// }

// export default function ProtectedRoute({ children, allowedUser }: ProtectedRouteProps) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const user = localStorage.getItem('user');
//     if (user === allowedUser) {
//       setIsAuthenticated(true);
//     } else {
//       router.replace('/');
//     }
//     setIsLoading(false);
//   }, [allowedUser, router]);

//   if (isLoading) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.className} font-sans`}>
//         <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) return null;

//   return <>{children}</>;
// }


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUser: string;
}

export default function ProtectedRoute({ children, allowedUser }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      return user === allowedUser;
    };

    // Initial check
    const authenticated = checkAuth();
    setIsAuthenticated(authenticated);
    setIsLoading(false);

    if (!authenticated) {
      router.replace('/');
      return;
    }

    // Set up storage event listener for cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        const currentAuth = checkAuth();
        setIsAuthenticated(currentAuth);
        if (!currentAuth) {
          router.replace('/');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Set up visibility change for when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentAuth = checkAuth();
        setIsAuthenticated(currentAuth);
        if (!currentAuth) {
          router.replace('/');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [allowedUser, router]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.className} font-sans`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}