// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { users, dashboardRoutes } from "@/sanity/lib/auth.config";

// export default function LoginPage() {
//   const router = useRouter();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();

//     const foundUser = users.find(
//       (u) => u.username === username.trim() && u.password === password.trim()
//     );

//     if (!foundUser) {
//       setError("❌ Invalid username or password");
//       return;
//     }

//     // ✅ Save session in localStorage
//     localStorage.setItem(
//       "user",
//       JSON.stringify({ username: foundUser.username, role: foundUser.role })
//     );

//     // ✅ Redirect to correct dashboard
//     router.push(dashboardRoutes[foundUser.role]);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
//         <h1 className="text-2xl font-bold text-center mb-4 text-[#8B5E3C]">
//           Login
//         </h1>

//         {error && (
//           <p className="text-red-500 text-center mb-3 text-sm">{error}</p>
//         )}

//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Username
//             </label>
//             <input
//               type="text"
//               placeholder="Enter username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full p-2 mt-1 border rounded-md focus:ring focus:ring-[#8B5E3C] focus:outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="Enter password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-2 mt-1 border rounded-md focus:ring focus:ring-[#8B5E3C] focus:outline-none"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-[#8B5E3C] text-white py-2 rounded-md hover:bg-[#6d4a2f] transition"
//           >
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
