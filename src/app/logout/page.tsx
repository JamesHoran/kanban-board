"use client";

import { LoadingScreen } from "@/components/onboarding/LoadingScreen";
import { useNhostClient } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
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

  return <LoadingScreen message="Logging you out..." />;
}
