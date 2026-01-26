// src/lib/seed-data/seed-repository.ts

/**
 * Pure functions for seeding boards.
 * These functions have no React dependencies and can be tested independently.
 */

/**
 * GraphQL mutation result type.
 * Allows accessing nested properties on data.
 * Matches Apollo's FetchResult.data type which can be null.
 */
type MutationData = {
  insert_boards_one?: { id?: string } | null;
  insert_labels_one?: { id?: string } | null;
  insert_columns_one?: { id?: string } | null;
  insert_cards_one?: { id?: string } | null;
  [key: string]: unknown;
};

type MutationResult = { data?: MutationData | null };

/**
 * GraphQL mutation function signatures.
 * Matches Apollo Client's useMutation function signature which takes
 * an options object containing variables (optional).
 */
export interface SeedMutations {
  createBoard: (options?: {
    variables: { name: string; owner_id: string };
  }) => Promise<MutationResult>;
  createLabel: (options?: {
    variables: {
      board_id: string;
      name: string;
      color: string;
    };
  }) => Promise<MutationResult>;
  createColumn: (options?: {
    variables: {
      board_id: string;
      name: string;
      position: number;
    };
  }) => Promise<MutationResult>;
  createCard: (options?: {
    variables: {
      column_id: string;
      title: string;
      description?: string;
      position: number;
      due_date?: string;
    };
  }) => Promise<MutationResult>;
  assignLabelToCard: (options?: {
    variables: {
      card_id: string;
      label_id: string;
    };
  }) => Promise<MutationResult>;
}

/**
 * Board template structure for seeding.
 */
export interface SeedBoard {
  id: string;
  name: string;
  labels: Array<{ id: string; name: string; color: string }>;
  columns: Array<{
    id: string;
    position: number;
    name: string;
    cards: Array<{
      id: string;
      position: number;
      title: string;
      description?: string;
      due_date?: string;
      card_labels: Array<{ label: { id: string } }>;
    }>;
  }>;
}

/**
 * Seed a user's account with sample boards.
 * Creates boards → labels → columns → cards → card_labels in parallel where possible.
 *
 * @param userId - The user to seed boards for
 * @param mutations - GraphQL mutation functions
 * @param templates - Board templates to create
 */
export async function seedUserBoards(
  userId: string,
  mutations: SeedMutations,
  templates: SeedBoard[],
): Promise<void> {
  // Create all boards in parallel
  const boardCreationPromises = templates.map((board) =>
    mutations.createBoard({
      variables: { name: board.name, owner_id: userId },
    }),
  );
  const boardResults = await Promise.all(boardCreationPromises);
  const boardIdMap = new Map<string, string>();

  templates.forEach((board, index) => {
    const boardId = boardResults[index].data?.insert_boards_one?.id;
    if (boardId) {
      boardIdMap.set(board.id, boardId);
    } else {
      console.error("[seedUserBoards] Failed to create board:", board.name);
    }
  });

  // Create all labels in parallel for each board
  const labelCreationPromises: Promise<void>[] = [];
  const labelIdMaps: Map<string, string>[] = [];

  templates.forEach((board) => {
    const boardId = boardIdMap.get(board.id);
    if (!boardId) return;

    const labelIdMap = new Map<string, string>();
    labelIdMaps.push(labelIdMap);

    board.labels?.forEach((label) => {
      labelCreationPromises.push(
        mutations
          .createLabel({
            variables: {
              board_id: boardId,
              name: label.name,
              color: label.color,
            },
          })
          .then((result) => {
            const createdLabelId = result.data?.insert_labels_one?.id;
            if (createdLabelId) {
              labelIdMap.set(label.id, createdLabelId);
            }
          }),
      );
    });
  });

  await Promise.all(labelCreationPromises);

  // Create all columns in parallel for each board
  const columnCreationPromises: Promise<void>[] = [];
  const columnIdMaps: Map<string, string>[] = [];

  templates.forEach((board) => {
    const boardId = boardIdMap.get(board.id);
    if (!boardId) return;

    const columnIdMap = new Map<string, string>();
    columnIdMaps.push(columnIdMap);

    board.columns?.forEach((column) => {
      columnCreationPromises.push(
        mutations
          .createColumn({
            variables: {
              board_id: boardId,
              name: column.name,
              position: column.position,
            },
          })
          .then((result) => {
            const columnId = result.data?.insert_columns_one?.id;
            if (columnId) {
              columnIdMap.set(column.id, columnId);
            }
          }),
      );
    });
  });

  await Promise.all(columnCreationPromises);

  // Create all cards in parallel for each column
  const cardCreationPromises: Promise<void>[] = [];

  templates.forEach((board, boardIndex) => {
    const boardId = boardIdMap.get(board.id);
    if (!boardId) return;

    const columnIdMap = columnIdMaps[boardIndex];
    const labelIdMap = labelIdMaps[boardIndex];

    board.columns?.forEach((column) => {
      const columnId = columnIdMap.get(column.id);
      if (!columnId) return;

      column.cards?.forEach((card) => {
        cardCreationPromises.push(
          mutations
            .createCard({
              variables: {
                column_id: columnId,
                title: card.title,
                description: card.description,
                position: card.position,
                due_date: card.due_date,
              },
            })
            .then((result) => {
              const cardId = result.data?.insert_cards_one?.id;
              if (cardId) {
                // Assign labels to card (can be done in parallel too)
                card.card_labels?.forEach((cardLabel) => {
                  const createdLabelId = labelIdMap.get(cardLabel.label.id);
                  if (createdLabelId) {
                    mutations.assignLabelToCard({
                      variables: {
                        card_id: cardId,
                        label_id: createdLabelId,
                      },
                    });
                  }
                });
              }
            }),
        );
      });
    });
  });

  await Promise.all(cardCreationPromises);
}
