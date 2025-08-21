"use client";

import { useRouter } from "next/navigation";
import { useNhostClient } from "@nhost/nextjs";
import { useEffect } from "react";

export default function LogOutPage() {
  const nhost = useNhostClient();
  const router = useRouter();

  useEffect(() => {
    async function logOut() {
      await nhost.auth.signOut();
      router.push("/login");
    }
    logOut();
  }, [nhost, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Logging you out...</p>
    </div>
  );
}
