"use client";

import { useQuery } from "@apollo/client";
import { GetBoardsDocument } from "@/gql/graphql";
import { useAuthenticationStatus } from "@nhost/nextjs";

export default function BoardsPage() {
  const { data, loading, error } = useQuery(GetBoardsDocument);
  const { isLoading: isAuthLoading } = useAuthenticationStatus();

  if (loading || isAuthLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <>
      <h1 className="heading-1">Boards</h1>
      {data?.boards.length > 0 ? (
        <ul>
          {data.boards.map((board: any) => (
            <li key={board.id}>{board.name}</li>
          ))}
        </ul>
      ) : (
        <p>No boards available.</p>
      )}
    </>
  );
}
