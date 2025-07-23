// 'use client';

// import { useRouter } from 'next/navigation';
// import { useState, useEffect } from 'react';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState('');
//   const router = useRouter();

//   // Check auth status on component mount
//   useEffect(() => {
//     const authToken = document.cookie.split('; ').find(row => row.startsWith('auth-token='));
//     if (authToken) {
//       const isPersistent = document.cookie.split('; ').some(row => row.startsWith('auth-persistent='));
//       if (isPersistent) {
//         router.push('/dashboard');
//       }
//     }
//   }, [router]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     try {
//       // Replace with actual authentication API call
//       const response = await mockAuthAPI(email, password);
      
//       if (response.success) {
//         // Set auth cookie
//         const cookieOptions = [
//           `auth-token=${response.token}`,
//           'path=/',
//           'SameSite=Strict',
//           rememberMe ? `max-age=${30 * 24 * 60 * 60}` : '',
//           rememberMe ? 'auth-persistent=true' : ''
//         ].filter(Boolean).join('; ');
        
//         document.cookie = cookieOptions;
//         router.push('/dashboard');
//       } else {
//         setError('Invalid credentials');
//       }
//     } catch (err) {
//       setError('Authentication failed. Please try again.');
//     }
//   };

//   // Mock authentication function - replace with real API call
//   const mockAuthAPI = async (email: string, password: string) => {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 500));
    
//     // Hardcoded credentials for demo - replace with real validation
//     const validCredentials = [
//       { email: 'admin@example.com', password: 'admin123' },
//       { email: 'user@example.com', password: 'user123' }
//     ];

//     const isValid = validCredentials.some(
//       cred => cred.email === email && cred.password === password
//     );

//     return {
//       success: isValid,
//       token: isValid ? 'mock-jwt-token' : null
//     };
//   };

//   return (
//     <div className="min-h-screen bg-white text-gray-800">
//       <main className="max-w-md mx-auto px-4 py-20">
//         <div className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-[#8B5E3C] mb-2">
//               Welcome Back
//             </h1>
//             <p className="text-gray-600">Please enter your credentials to login</p>
//           </div>

//           {error && (
//             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//               {error}
//             </div>
//           )}

//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8B5E3C] focus:border-[#8B5E3C]"
//                 placeholder="your@email.com"
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8B5E3C] focus:border-[#8B5E3C]"
//                 placeholder="••••••••"
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   id="remember-me"
//                   name="remember-me"
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   className="h-4 w-4 text-[#8B5E3C] focus:ring-[#8B5E3C] border-gray-300 rounded"
//                 />
//                 <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
//                   Remember me
//                 </label>
//               </div>

//               <div className="text-sm">
//                 <a href="#" className="font-medium text-[#8B5E3C] hover:text-[#6d4a2e]">
//                   Forgot password?
//                 </a>
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B5E3C] hover:bg-[#6d4a2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5E3C]"
//               >
//                 Sign in
//               </button>
//             </div>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Don't have an account?{' '}
//               <a href="#" className="font-medium text-[#8B5E3C] hover:text-[#6d4a2e]">
//                 Contact admin
//               </a>
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }