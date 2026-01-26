// import {
//   AssignLabelToCardDocument,
//   CreateBoardDocument,
//   CreateCardDocument,
//   CreateColumnDocument,
//   CreateLabelDocument,
//   GetBoardsForUserQueryDocument,
// } from "@/gql/graphql";
// import { useMutation, useQuery } from "@apollo/client";

// import { Board } from "@/app/boards/types";
// import { useEffect } from "react";

// export const useCheckAndSeedBoards = (
//   isAuthenticated: boolean,
//   authIsLoading: boolean,
//   shouldSeed: boolean,
//   userId: undefined | string,
//   onCompleted: (isAuthenticated: boolean, userId: string | undefined) => void,
// ) => {
//   console.log("starting seed");
//   const [createBoard] = useMutation(CreateBoardDocument);
//   const [createLabel] = useMutation(CreateLabelDocument);
//   const [createColumn] = useMutation(CreateColumnDocument);
//   const [createCard] = useMutation(CreateCardDocument);
//   const [assignLabelToCard] = useMutation(AssignLabelToCardDocument);

//   const boards: Board[] = [
//     {
//       id: "board-1",
//       name: "Home Renovation",
//       labels: [
//         { id: "lbl-1", name: "Kitchen", color: "#e57373" },
//         { id: "lbl-2", name: "Budget", color: "#64b5f6" },
//         { id: "lbl-3", name: "Urgent", color: "#f44336" },
//       ],
//       columns: [
//         {
//           id: "col-1",
//           position: 0,
//           name: "To Research",
//           cards: [
//             {
//               id: "card-1",
//               position: 0,
//               title: "Compare kitchen countertop materials",
//               description:
//                 "Quartz vs granite vs butcher block - check durability, cost, and maintenance",
//               due_date: "2024-02-15T00:00:00Z",
//               card_labels: [
//                 {
//                   card_id: "card-1",
//                   label: { id: "lbl-1", name: "Kitchen", color: "#e57373" },
//                 },
//                 {
//                   card_id: "card-1",
//                   label: { id: "lbl-2", name: "Budget", color: "#64b5f6" },
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           id: "col-2",
//           position: 1,
//           name: "In Progress",
//           cards: [
//             {
//               id: "card-2",
//               position: 0,
//               title: "Get quotes from contractors",
//               description: "Called 3 contractors, waiting on 2 more estimates",
//               due_date: "2024-01-30T00:00:00Z",
//               card_labels: [
//                 {
//                   card_id: "card-2",
//                   label: { id: "lbl-3", name: "Urgent", color: "#f44336" },
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           id: "col-3",
//           position: 2,
//           name: "Done",
//           cards: [
//             {
//               id: "card-3",
//               position: 0,
//               title: "Measure bathroom dimensions",
//               description: "Main: 8'x6', Vanity area: 36\" wide",
//               card_labels: [],
//             },
//             {
//               id: "card-4",
//               position: 1,
//               title: "Set renovation budget",
//               description: "Approved: $25,000 total",
//               card_labels: [
//                 {
//                   card_id: "card-4",
//                   label: { id: "lbl-2", name: "Budget", color: "#64b5f6" },
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//     {
//       id: "board-2",
//       name: "Product Roadmap",
//       labels: [
//         { id: "lbl-4", name: "Enhancement", color: "#4db6ac" },
//         { id: "lbl-5", name: "Nice to Have", color: "#90a4ae" },
//         { id: "lbl-6", name: "Mobile", color: "#ba68c8" },
//         { id: "lbl-7", name: "Feature", color: "#7986cb" },
//         { id: "lbl-8", name: "High Priority", color: "#e57373" },
//         { id: "lbl-9", name: "Testing", color: "#fff176" },
//         { id: "lbl-10", name: "Design", color: "#f06292" },
//         { id: "lbl-11", name: "Setup", color: "#a1887f" },
//       ],
//       columns: [
//         {
//           id: "col-4",
//           position: 0,
//           name: "Backlog",
//           cards: [
//             {
//               id: "card-5",
//               position: 0,
//               title: "Add dark mode support",
//               description:
//                 "Implement system preference detection + manual toggle",
//               card_labels: [
//                 {
//                   card_id: "card-5",
//                   label: { id: "lbl-4", name: "Enhancement", color: "#4db6ac" },
//                 },
//                 {
//                   card_id: "card-5",
//                   label: {
//                     id: "lbl-5",
//                     name: "Nice to Have",
//                     color: "#90a4ae",
//                   },
//                 },
//               ],
//             },
//             {
//               id: "card-6",
//               position: 1,
//               title: "Mobile responsive nav",
//               description: "Hamburger menu for screens under 768px",
//               card_labels: [
//                 {
//                   card_id: "card-6",
//                   label: { id: "lbl-6", name: "Mobile", color: "#ba68c8" },
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           id: "col-5",
//           position: 1,
//           name: "In Development",
//           cards: [
//             {
//               id: "card-7",
//               position: 0,
//               title: "User authentication flow",
//               description:
//                 "Login, signup, password reset pages + API integration",
//               due_date: "2024-02-28T00:00:00Z",
//               card_labels: [
//                 {
//                   card_id: "card-7",
//                   label: { id: "lbl-7", name: "Feature", color: "#7986cb" },
//                 },
//                 {
//                   card_id: "card-7",
//                   label: {
//                     id: "lbl-8",
//                     name: "High Priority",
//                     color: "#e57373",
//                   },
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           id: "col-6",
//           position: 2,
//           name: "Testing",
//           cards: [
//             {
//               id: "card-8",
//               position: 0,
//               title: "Write unit tests for cart module",
//               description: "Cover add, remove, update quantity operations",
//               due_date: "2024-02-10T00:00:00Z",
//               card_labels: [
//                 {
//                   card_id: "card-8",
//                   label: { id: "lbl-9", name: "Testing", color: "#fff176" },
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           id: "col-7",
//           position: 3,
//           name: "Done",
//           cards: [
//             {
//               id: "card-9",
//               position: 0,
//               title: "Design system setup",
//               description:
//                 "Created color palette, typography scale, component library",
//               card_labels: [
//                 {
//                   card_id: "card-9",
//                   label: { id: "lbl-10", name: "Design", color: "#f06292" },
//                 },
//               ],
//             },
//             {
//               id: "card-10",
//               position: 1,
//               title: "Project scaffolding",
//               description:
//                 "Next.js app initialized, ESLint & Prettier configured",
//               card_labels: [
//                 {
//                   card_id: "card-10",
//                   label: { id: "lbl-11", name: "Setup", color: "#a1887f" },
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   ];

//   // Always call the query, but skip when userId is not available
//   const { data } = useQuery(GetBoardsForUserQueryDocument, {
//     variables: { userId: userId || "" },
//     // skip: !shouldSeed || !userId,
//     skip: !isAuthenticated || !authIsLoading || !shouldSeed || !userId,
//   });

//   // Always call useEffect - Rules of Hooks require all hooks to be called every render
//   // Only execute the effect logic when conditions are met
//   useEffect(() => {
//     if (!shouldSeed || !userId || !data) {
//       console.warn("Seeding skipped - conditions not met:", {
//         shouldSeed,
//         userId,
//         data,
//       });
//       onCompleted(isAuthenticated, userId);
//       return;
//     }

//     console.log("Seeding conditions met - starting seed process:", { data });
//     async function seedBoards() {
//       if (data && !data.boards.length) {
//         // console.log("No boards found - seeding sample boards");

//         // Create all boards in parallel
//         const boardCreationPromises = boards.map((board) =>
//           createBoard({
//             variables: { name: board.name, owner_id: userId },
//           }),
//         );
//         const boardResults = await Promise.all(boardCreationPromises);
//         const boardIdMap = new Map<string, string>();

//         boards.forEach((board, index) => {
//           const boardId = boardResults[index].data?.insert_boards_one?.id;
//           if (boardId) {
//             boardIdMap.set(board.id, boardId);
//             console.log("Created board:", board.name, "with ID:", boardId);
//           } else {
//             console.error("Failed to create board:", board.name);
//           }
//         });

//         // Create all labels in parallel for each board
//         const labelCreationPromises: Promise<any>[] = [];
//         const labelIdMaps: Map<string, string>[] = [];

//         boards.forEach((board, boardIndex) => {
//           const boardId = boardIdMap.get(board.id);
//           if (!boardId) return;

//           const labelIdMap = new Map<string, string>();
//           labelIdMaps.push(labelIdMap);

//           board.labels?.forEach((label) => {
//             labelCreationPromises.push(
//               createLabel({
//                 variables: {
//                   board_id: boardId,
//                   name: label.name,
//                   color: label.color,
//                 },
//               }).then((result) => {
//                 const createdLabelId = result.data?.insert_labels_one?.id;
//                 if (createdLabelId) {
//                   labelIdMap.set(label.id, createdLabelId);
//                   // console.log("Created label:", label.name, "with ID:", createdLabelId);
//                 }
//               }),
//             );
//           });
//         });

//         await Promise.all(labelCreationPromises);
//         console.log("All labels created");

//         // Create all columns in parallel for each board
//         const columnCreationPromises: Promise<any>[] = [];
//         const columnIdMaps: Map<string, string>[] = [];

//         boards.forEach((board, boardIndex) => {
//           const boardId = boardIdMap.get(board.id);
//           if (!boardId) return;

//           const columnIdMap = new Map<string, string>();
//           columnIdMaps.push(columnIdMap);

//           board.columns?.forEach((column) => {
//             columnCreationPromises.push(
//               createColumn({
//                 variables: {
//                   board_id: boardId,
//                   name: column.name,
//                   position: column.position,
//                 },
//               }).then((result) => {
//                 const columnId = result.data?.insert_columns_one?.id;
//                 if (columnId) {
//                   columnIdMap.set(column.id, columnId);
//                   // console.log("Created column:", column.name, "with ID:", columnId);
//                 }
//               }),
//             );
//           });
//         });

//         await Promise.all(columnCreationPromises);
//         console.log("All columns created");

//         // Create all cards in parallel for each column
//         const cardCreationPromises: Promise<any>[] = [];

//         boards.forEach((board, boardIndex) => {
//           const boardId = boardIdMap.get(board.id);
//           if (!boardId) return;

//           const columnIdMap = columnIdMaps[boardIndex];
//           const labelIdMap = labelIdMaps[boardIndex];

//           board.columns?.forEach((column) => {
//             const columnId = columnIdMap.get(column.id);
//             if (!columnId) return;

//             column.cards?.forEach((card) => {
//               cardCreationPromises.push(
//                 createCard({
//                   variables: {
//                     column_id: columnId,
//                     title: card.title,
//                     description: card.description,
//                     position: card.position,
//                     due_date: card.due_date,
//                   },
//                 }).then((result) => {
//                   const cardId = result.data?.insert_cards_one?.id;
//                   if (cardId) {
//                     // console.log("Created card:", card.title, "with ID:", cardId);

//                     // Assign labels to card (can be done in parallel too)
//                     card.card_labels?.forEach((cardLabel) => {
//                       const createdLabelId = labelIdMap.get(cardLabel.label.id);
//                       if (createdLabelId) {
//                         assignLabelToCard({
//                           variables: {
//                             card_id: cardId,
//                             label_id: createdLabelId,
//                           },
//                         });
//                         console.log(
//                           "Assigned label",
//                           cardLabel.label.name,
//                           "to card",
//                           card.title,
//                         );
//                       }
//                     });
//                   }
//                 }),
//               );
//             });
//           });
//         });

//         await Promise.all(cardCreationPromises);
//         console.log("Seeding completed successfully");
//       } else {
//         // console.log("Boards already exist, skipping seeding");
//       }
//       onCompleted(isAuthenticated, userId);
//     }

//     seedBoards();
//   }, [data]);
// };
import {
  AssignLabelToCardDocument,
  CreateBoardDocument,
  CreateCardDocument,
  CreateColumnDocument,
  CreateLabelDocument,
  GetBoardsForUserQueryDocument,
  GetBoardsForUserQueryQuery,
} from "@/gql/graphql";
import { useMutation, useQuery } from "@apollo/client";

import { Board } from "@/app/boards/types";
import { useEffect, useState } from "react";

export const useCheckAndSeedBoards = (
  isAuthenticated: boolean,
  authIsLoading: boolean,
  shouldSeed: boolean,
  userId: undefined | string,
  onCompleted: (isAuthenticated: boolean, userId: string | undefined) => void,
): boolean => {
  console.log("starting seed");
  const [didSeed, setDidSeed] = useState(false);
  const [createBoard] = useMutation(CreateBoardDocument);
  const [createLabel] = useMutation(CreateLabelDocument);
  const [createColumn] = useMutation(CreateColumnDocument);
  const [createCard] = useMutation(CreateCardDocument);
  const [assignLabelToCard] = useMutation(AssignLabelToCardDocument);

  const boards: Board[] = [
    {
      id: "board-1",
      name: "Home Renovation",
      labels: [
        { id: "lbl-1", name: "Kitchen", color: "#e57373" },
        { id: "lbl-2", name: "Budget", color: "#64b5f6" },
        { id: "lbl-3", name: "Urgent", color: "#f44336" },
      ],
      columns: [
        {
          id: "col-1",
          position: 0,
          name: "To Research",
          cards: [
            {
              id: "card-1",
              position: 0,
              title: "Compare kitchen countertop materials",
              description:
                "Quartz vs granite vs butcher block - check durability, cost, and maintenance",
              due_date: "2024-02-15T00:00:00Z",
              card_labels: [
                {
                  card_id: "card-1",
                  label: { id: "lbl-1", name: "Kitchen", color: "#e57373" },
                },
                {
                  card_id: "card-1",
                  label: { id: "lbl-2", name: "Budget", color: "#64b5f6" },
                },
              ],
            },
          ],
        },
        {
          id: "col-2",
          position: 1,
          name: "In Progress",
          cards: [
            {
              id: "card-2",
              position: 0,
              title: "Get quotes from contractors",
              description: "Called 3 contractors, waiting on 2 more estimates",
              due_date: "2024-01-30T00:00:00Z",
              card_labels: [
                {
                  card_id: "card-2",
                  label: { id: "lbl-3", name: "Urgent", color: "#f44336" },
                },
              ],
            },
          ],
        },
        {
          id: "col-3",
          position: 2,
          name: "Done",
          cards: [
            {
              id: "card-3",
              position: 0,
              title: "Measure bathroom dimensions",
              description: "Main: 8'x6', Vanity area: 36\" wide",
              card_labels: [],
            },
            {
              id: "card-4",
              position: 1,
              title: "Set renovation budget",
              description: "Approved: $25,000 total",
              card_labels: [
                {
                  card_id: "card-4",
                  label: { id: "lbl-2", name: "Budget", color: "#64b5f6" },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "board-2",
      name: "Product Roadmap",
      labels: [
        { id: "lbl-4", name: "Enhancement", color: "#4db6ac" },
        { id: "lbl-5", name: "Nice to Have", color: "#90a4ae" },
        { id: "lbl-6", name: "Mobile", color: "#ba68c8" },
        { id: "lbl-7", name: "Feature", color: "#7986cb" },
        { id: "lbl-8", name: "High Priority", color: "#e57373" },
        { id: "lbl-9", name: "Testing", color: "#fff176" },
        { id: "lbl-10", name: "Design", color: "#f06292" },
        { id: "lbl-11", name: "Setup", color: "#a1887f" },
      ],
      columns: [
        {
          id: "col-4",
          position: 0,
          name: "Backlog",
          cards: [
            {
              id: "card-5",
              position: 0,
              title: "Add dark mode support",
              description:
                "Implement system preference detection + manual toggle",
              card_labels: [
                {
                  card_id: "card-5",
                  label: { id: "lbl-4", name: "Enhancement", color: "#4db6ac" },
                },
                {
                  card_id: "card-5",
                  label: {
                    id: "lbl-5",
                    name: "Nice to Have",
                    color: "#90a4ae",
                  },
                },
              ],
            },
            {
              id: "card-6",
              position: 1,
              title: "Mobile responsive nav",
              description: "Hamburger menu for screens under 768px",
              card_labels: [
                {
                  card_id: "card-6",
                  label: { id: "lbl-6", name: "Mobile", color: "#ba68c8" },
                },
              ],
            },
          ],
        },
        {
          id: "col-5",
          position: 1,
          name: "In Development",
          cards: [
            {
              id: "card-7",
              position: 0,
              title: "User authentication flow",
              description:
                "Login, signup, password reset pages + API integration",
              due_date: "2024-02-28T00:00:00Z",
              card_labels: [
                {
                  card_id: "card-7",
                  label: { id: "lbl-7", name: "Feature", color: "#7986cb" },
                },
                {
                  card_id: "card-7",
                  label: {
                    id: "lbl-8",
                    name: "High Priority",
                    color: "#e57373",
                  },
                },
              ],
            },
          ],
        },
        {
          id: "col-6",
          position: 2,
          name: "Testing",
          cards: [
            {
              id: "card-8",
              position: 0,
              title: "Write unit tests for cart module",
              description: "Cover add, remove, update quantity operations",
              due_date: "2024-02-10T00:00:00Z",
              card_labels: [
                {
                  card_id: "card-8",
                  label: { id: "lbl-9", name: "Testing", color: "#fff176" },
                },
              ],
            },
          ],
        },
        {
          id: "col-7",
          position: 3,
          name: "Done",
          cards: [
            {
              id: "card-9",
              position: 0,
              title: "Design system setup",
              description:
                "Created color palette, typography scale, component library",
              card_labels: [
                {
                  card_id: "card-9",
                  label: { id: "lbl-10", name: "Design", color: "#f06292" },
                },
              ],
            },
            {
              id: "card-10",
              position: 1,
              title: "Project scaffolding",
              description:
                "Next.js app initialized, ESLint & Prettier configured",
              card_labels: [
                {
                  card_id: "card-10",
                  label: { id: "lbl-11", name: "Setup", color: "#a1887f" },
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  // Always call the query, but skip when userId is not available
  console.log(
    "get data?",
    isAuthenticated,
    authIsLoading,
    shouldSeed,
    userId,
    "skip",
    !isAuthenticated || authIsLoading || !shouldSeed || !userId,
  );
  let data: GetBoardsForUserQueryQuery | undefined;
  try {
    const { data: boardsData } = useQuery(GetBoardsForUserQueryDocument, {
      variables: { userId: userId || "" },
      // skip: !shouldSeed || !userId,
      skip: !isAuthenticated || authIsLoading || !shouldSeed || !userId,
      // onCompleted: () => {
      //   console.log("received new data");
      // },
    });
    data = boardsData;
  } catch {
    console.error("failed to check if database was seeded");
  }

  // Always call useEffect - Rules of Hooks require all hooks to be called every render
  // Only execute the effect logic when conditions are met
  useEffect(() => {
    if (!shouldSeed || !userId || !data) {
      console.warn("Seeding skipped - conditions not met:", {
        shouldSeed,
        userId,
        data,
      });
      onCompleted(isAuthenticated, userId);
      return;
    }

    // Mark that seeding was attempted
    setDidSeed(true);

    console.log("Seeding conditions met - starting seed process:", { data });
    async function seedBoards() {
      if (data && !data.boards.length) {
        // console.log("No boards found - seeding sample boards");

        // Create all boards in parallel
        const boardCreationPromises = boards.map((board) =>
          createBoard({
            variables: { name: board.name, owner_id: userId },
          }),
        );
        const boardResults = await Promise.all(boardCreationPromises);
        const boardIdMap = new Map<string, string>();

        boards.forEach((board, index) => {
          const boardId = boardResults[index].data?.insert_boards_one?.id;
          if (boardId) {
            boardIdMap.set(board.id, boardId);
            console.log("Created board:", board.name, "with ID:", boardId);
          } else {
            console.error("Failed to create board:", board.name);
          }
        });

        // Create all labels in parallel for each board
        const labelCreationPromises: Promise<any>[] = [];
        const labelIdMaps: Map<string, string>[] = [];

        boards.forEach((board, boardIndex) => {
          const boardId = boardIdMap.get(board.id);
          if (!boardId) return;

          const labelIdMap = new Map<string, string>();
          labelIdMaps.push(labelIdMap);

          board.labels?.forEach((label) => {
            labelCreationPromises.push(
              createLabel({
                variables: {
                  board_id: boardId,
                  name: label.name,
                  color: label.color,
                },
              }).then((result) => {
                const createdLabelId = result.data?.insert_labels_one?.id;
                if (createdLabelId) {
                  labelIdMap.set(label.id, createdLabelId);
                  // console.log("Created label:", label.name, "with ID:", createdLabelId);
                }
              }),
            );
          });
        });

        await Promise.all(labelCreationPromises);
        console.log("All labels created");

        // Create all columns in parallel for each board
        const columnCreationPromises: Promise<any>[] = [];
        const columnIdMaps: Map<string, string>[] = [];

        boards.forEach((board, boardIndex) => {
          const boardId = boardIdMap.get(board.id);
          if (!boardId) return;

          const columnIdMap = new Map<string, string>();
          columnIdMaps.push(columnIdMap);

          board.columns?.forEach((column) => {
            columnCreationPromises.push(
              createColumn({
                variables: {
                  board_id: boardId,
                  name: column.name,
                  position: column.position,
                },
              }).then((result) => {
                const columnId = result.data?.insert_columns_one?.id;
                if (columnId) {
                  columnIdMap.set(column.id, columnId);
                  // console.log("Created column:", column.name, "with ID:", columnId);
                }
              }),
            );
          });
        });

        await Promise.all(columnCreationPromises);
        console.log("All columns created");

        // Create all cards in parallel for each column
        const cardCreationPromises: Promise<any>[] = [];

        boards.forEach((board, boardIndex) => {
          const boardId = boardIdMap.get(board.id);
          if (!boardId) return;

          const columnIdMap = columnIdMaps[boardIndex];
          const labelIdMap = labelIdMaps[boardIndex];

          board.columns?.forEach((column) => {
            const columnId = columnIdMap.get(column.id);
            if (!columnId) return;

            column.cards?.forEach((card) => {
              cardCreationPromises.push(
                createCard({
                  variables: {
                    column_id: columnId,
                    title: card.title,
                    description: card.description,
                    position: card.position,
                    due_date: card.due_date,
                  },
                }).then((result) => {
                  const cardId = result.data?.insert_cards_one?.id;
                  if (cardId) {
                    // console.log("Created card:", card.title, "with ID:", cardId);

                    // Assign labels to card (can be done in parallel too)
                    card.card_labels?.forEach((cardLabel) => {
                      const createdLabelId = labelIdMap.get(cardLabel.label.id);
                      if (createdLabelId) {
                        assignLabelToCard({
                          variables: {
                            card_id: cardId,
                            label_id: createdLabelId,
                          },
                        });
                        console.log(
                          "Assigned label",
                          cardLabel.label.name,
                          "to card",
                          card.title,
                        );
                      }
                    });
                  }
                }),
              );
            });
          });
        });

        await Promise.all(cardCreationPromises);
        console.log("Seeding completed successfully");
      } else {
        // console.log("Boards already exist, skipping seeding");
      }
      onCompleted(isAuthenticated, userId);
    }

    seedBoards();
  }, [data]);

  return didSeed;
};
