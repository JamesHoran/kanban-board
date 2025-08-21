"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthenticationStatus, useSignOut } from "@nhost/nextjs";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const { signOut } = useSignOut();

  if (!mounted) return null; // don’t render until client

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center gap-6 p-8">
      {isAuthenticated ? (
        <>
          <h1 className="text-3xl font-bold">Welcome!</h1>
          <div className="flex gap-4">
            <Link href="/boards" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              View Boards
            </Link>
            <button onClick={() => signOut()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-gray-600">Please log in or sign up to get started.</p>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Sign Up
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
