// src/lib/hooks/use-seeding-service.ts
"use client";

import {
  AssignLabelToCardDocument,
  CreateBoardDocument,
  CreateCardDocument,
  CreateColumnDocument,
  CreateLabelDocument,
  GetBoardsForUserQueryDocument,
} from "@/gql/graphql";
import { apolloClient } from "@/lib/apolloclient";
import { BOARD_TEMPLATES, seedUserBoards } from "@/lib/seed-data/index";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";

export type SeedingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "complete" }
  | { status: "error"; error: string };

/**
 * Manages the board seeding process.
 * Uses direct client.query() with fetchPolicy: "network-only" to bypass
 * Apollo cache issues between users.
 *
 * Uses explicit state enums (not just booleans) for better debugging.
 * See: https://builder.aws.com/content/35mjuFWn4hSGCK6JjaZHFIGrzPG/reactjs-best-practices-in-2026
 */
export function useSeedingService(userId: string | undefined): SeedingState {
  const [state, setState] = useState<SeedingState>({ status: "idle" });

  const createBoardResult = useMutation(CreateBoardDocument);
  const createLabelResult = useMutation(CreateLabelDocument);
  const createColumnResult = useMutation(CreateColumnDocument);
  const createCardResult = useMutation(CreateCardDocument);
  const assignLabelResult = useMutation(AssignLabelToCardDocument);

  const mutations = {
    createBoard: createBoardResult[0],
    createLabel: createLabelResult[0],
    createColumn: createColumnResult[0],
    createCard: createCardResult[0],
    assignLabelToCard: assignLabelResult[0],
  };

  useEffect(() => {
    if (!userId) {
      setState({ status: "idle" });
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setState({ status: "loading" });

        // Check for existing boards using direct query to bypass cache
        const result = await apolloClient.query({
          query: GetBoardsForUserQueryDocument,
          variables: { userId },
          fetchPolicy: "network-only", // Bypass cache, always fresh
        });

        if (!mounted) return;

        if (result.data.boards.length > 0) {
          setState({ status: "complete" });
          return;
        }

        // Seed new boards
        await seedUserBoards(userId, mutations, BOARD_TEMPLATES);

        if (mounted) {
          setState({ status: "complete" });
        }
      } catch (error) {
        if (!mounted) return;
        console.error("[useSeedingService] Seeding failed:", error);
        setState({
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })();

    return () => {
      mounted = false;
    };
    // ONLY depends on userId - forces re-run on user change.
    // mutations are stable from useMutation and don't need to be in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return state;
}
