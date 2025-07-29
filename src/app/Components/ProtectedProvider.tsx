// "use client";

// import { useEffect } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { useAuth } from "@/hooks/useAuth"; // ✅ your auth hook

// export default function ProtectedProvider({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth(); // ✅ get user auth state
//   const router = useRouter();
//   const pathname = usePathname();

//   // ✅ Public routes that don’t need login
//   const publicRoutes = ["/login"];

//   const isPublic = publicRoutes.includes(pathname);

//   useEffect(() => {
//     if (!loading && !user && !isPublic) {
//       router.replace("/login"); // ✅ force login
//     }
//   }, [loading, user, pathname]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   // ✅ If not logged in & route is protected → don’t render
//   if (!user && !isPublic) {
//     return null;
//   }

//   return <>{children}</>;
// }
