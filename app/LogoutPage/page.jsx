"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("You have been logged out.");
    router.push("/LoginPage");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <button
        onClick={handleLogout}
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded focus:outline-none"
      >
        Logout
      </button>
    </div>
  );
}

