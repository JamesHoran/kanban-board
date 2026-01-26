// "use client";

// import { nhost } from "@/lib/nhost";
// import { useCheckAndSeedBoards } from "@/lib/seed-data";
// import { useAuthenticationStatus, useSignOut, useUserId } from "@nhost/nextjs";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { v4 as uuidv4 } from "uuid";

// export default function Home() {
//   const { isAuthenticated, isLoading: authIsLoading } =
//     useAuthenticationStatus();
//   const userId = useUserId();
//   const autoSeed: boolean = true;
//   const [seeding, setSeeding] = useState<boolean>(true);
//   useEffect(() => {
//     if (!seeding) {
//       console.log("Starting routing");
//       console.log("seeding", seeding);
//       router.push("/boards");
//     }
//   }, [seeding]);
//   useCheckAndSeedBoards(
//     isAuthenticated,
//     authIsLoading,
//     autoSeed,
//     userId,
//     (isAuthenticated, userId) => {
//       if (isAuthenticated && userId) {
//         // check if it's true first to prevent infinite renders
//         console.log("setting seeding state");
//         setSeeding(false);
//       }
//     },
//   );
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   const { signOut } = useSignOut();
//   const [hasAttemptedSignUp, setHasAttemptedSignUp] = useState(false);

//   const autoSignUp: boolean = true;
//   // const autoSignUp: boolean = false;

//   // Move auto-signup logic into useEffect to prevent running on every render
//   useEffect(() => {
//     if (authIsLoading || isAuthenticated) return;
//     // if (autoSignUp && !hasAttemptedSignUp && !isAuthenticated && !userId) {
//     console.log("starting sign up");
//     (async function autoSignUp() {
//       const randomId = uuidv4().substring(0, 8);
//       const randomEmail = `user_${randomId}@example.com`;
//       const password = "Aa12345678";

//       const { error } = await nhost.auth.signUp({
//         email: randomEmail,
//         password,
//       });

//       if (error) {
//         console.error("Auto sign up failed:", error.message, { userId });
//       } else {
//         // setUserId is no longer needed - using useUserId hook instead
//         setHasAttemptedSignUp(true);
//       }
//     })();
//     // }
//     // }, [autoSignUp, hasAttemptedSignUp, isAuthenticated, userId]);
//   }, [isAuthenticated, authIsLoading]);

//   if (!mounted) return null; // don’t render until client

//   if (authIsLoading || seeding) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <p>
//           Loading or Seeding
//           xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <main className="flex flex-col items-center gap-6 p-8">
//       {isAuthenticated ? (
//         <>
//           <h1 className="text-3xl font-bold">Welcome!</h1>
//           <div className="flex gap-4">
//             <Link
//               href="/boards"
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//             >
//               View Boards
//             </Link>
//             <button
//               onClick={() => signOut()}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
//             >
//               Logout
//             </button>
//           </div>
//         </>
//       ) : (
//         <>
//           <h1 className="text-3xl font-bold">Kanban Board</h1>
//           <p className="text-gray-600">
//             Please log in or sign up to get started.
//           </p>
//           <div className="flex gap-4">
//             <Link
//               href="/login"
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//             >
//               Login
//             </Link>
//             <Link
//               href="/signup"
//               className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
//             >
//               Sign Up
//             </Link>
//           </div>
//         </>
//       )}
//     </main>
//   );
// }
"use client";

import { nhost } from "@/lib/nhost";
import { useCheckAndSeedBoards } from "@/lib/seed-data";
import { useAuthenticationStatus, useSignOut, useUserId } from "@nhost/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const { isAuthenticated, isLoading: authIsLoading } =
    useAuthenticationStatus();
  const userId = useUserId();
  const autoSeed: boolean = true;
  const router = useRouter();
  const [seeding, setSeeding] = useState<boolean>(true);

  // Use the return value from useCheckAndSeedBoards to update seeding state
  const isSeeding = useCheckAndSeedBoards(
    isAuthenticated,
    authIsLoading,
    autoSeed,
    userId,
    (isAuthenticated, userId) => {
      if (isAuthenticated && userId) {
        console.log("Seeding completed, routing to boards");
        setSeeding(false);
      }
    },
  );

  // Sync seeding state with hook return value
  useEffect(() => {
    console.log("finished seed", isSeeding);
    console.log("seeding", seeding);
    setSeeding(!isSeeding);
    console.log("seeding", seeding);
    if (!isSeeding) {
      router.push("/boards");
    }
  }, [isSeeding]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { signOut } = useSignOut();
  const [hasAttemptedSignUp, setHasAttemptedSignUp] = useState(false);

  const autoSignUp: boolean = true;
  // const autoSignUp: boolean = false;

  // Move auto-signup logic into useEffect to prevent running on every render
  useEffect(() => {
    if (authIsLoading || isAuthenticated) return;
    // if (autoSignUp && !hasAttemptedSignUp && !isAuthenticated && !userId) {
    console.log("starting sign up");
    (async function autoSignUp() {
      const randomId = uuidv4().substring(0, 8);
      const randomEmail = `user_${randomId}@example.com`;
      const password = "Aa12345678";

      const { error } = await nhost.auth.signUp({
        email: randomEmail,
        password,
      });

      if (error) {
        console.error("Auto sign up failed:", error.message, { userId });
      } else {
        // setUserId is no longer needed - using useUserId hook instead
        setHasAttemptedSignUp(true);
      }
    })();
    // }
    // }, [autoSignUp, hasAttemptedSignUp, isAuthenticated, userId]);
  }, [isAuthenticated, authIsLoading]);

  if (!mounted) return null; // don’t render until client

  if (authIsLoading || seeding) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>
          Loading or Seeding
          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center gap-6 p-8">
      {isAuthenticated ? (
        <>
          <h1 className="text-3xl font-bold">Welcome!</h1>
          <div className="flex gap-4">
            <Link
              href="/boards"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              View Boards
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-gray-600">
            Please log in or sign up to get started.
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
