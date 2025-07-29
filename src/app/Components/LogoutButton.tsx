"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <button
      onClick={logout}
      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
    >
      Logout
    </button>
  );
}
