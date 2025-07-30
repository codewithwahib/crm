// 'use client';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { DM_Sans } from 'next/font/google';

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-dm-sans',
// });

// interface Props {
//   allowedUser: string;
//   children: React.ReactNode;
// }

// export default function ProtectedRoute({ allowedUser, children }: Props) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const user = localStorage.getItem('user');
//     if (user !== allowedUser) {
//       router.push('/login');
//     } else {
//       setIsLoading(false);
//     }
//   }, [allowedUser, router]);

//  if (isLoading) {
//   return (
//     <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.variable} font-sans`}>
//       <div className="flex flex-col items-center space-y-4">
//         <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#8B5E3C] border-t-transparent shadow-lg"></div>
//       </div>
//     </div>
//   );
// }


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
    const user = localStorage.getItem('user');

    if (!user || user !== allowedUser) {
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, [allowedUser, router]);

  // Prevent rendering until auth check is complete
  if (isLoading) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-white text-gray-800 ${dmSans.className} font-sans`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent shadow-lg"></div>
      </div>
    </div>
  );
}

  // Show nothing if not authenticated
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
