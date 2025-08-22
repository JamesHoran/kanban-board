"use client";

import { useState, useRef, useEffect } from "react";
import ColumnView from "./ColumnView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@apollo/client";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import {
  CreateColumnDocument,
  UpdateBoardDocument,
  UpdateColumnDocument,
  UpdateCardDocument,
  CreateCardDocument,
  DeleteCardDocument,
  DeleteColumnDocument,
} from "@/gql/graphql";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useBoard } from "./BoardContext";
import { Board, Card } from "./types";

interface BoardViewProps {
  handleDeleteLocalBoard: () => void;
}

export default function BoardView({ handleDeleteLocalBoard }: BoardViewProps) {
  const { board, setBoard, handleUpdateColumnId } = useBoard();

  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(board.name);
  const [showInput, setShowInput] = useState(false);

  const [createColumn] = useMutation(CreateColumnDocument);
  const [updateBoard] = useMutation(UpdateBoardDocument);
  const [updateColumn] = useMutation(UpdateColumnDocument);
  const [deleteColumn] = useMutation(DeleteColumnDocument);
  const [updateCard] = useMutation(UpdateCardDocument);
  const [createCard] = useMutation(CreateCardDocument);
  const [deleteCard] = useMutation(DeleteCardDocument);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  if (!board) {
    return null; // or a loading spinner
  }

  const handleUpdateBoard = async () => {
    if (editedName.trim() === board.name) {
      setIsEditing(false);
      return;
    }

    // Optimistic UI update: Update the local 'board' state immediately
    setBoard(prevBoard => ({ ...prevBoard, name: editedName.trim() }));

    try {
      await updateBoard({
        variables: { id: board.id, patch: { name: editedName } },
      });
    } catch (error) {
      console.error("Error updating board name:", error);
      // The subscription will eventually correct the state if the update fails.
    }
    setIsEditing(false);
  };

  function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "column") {
      if (source.index === destination.index) return;

      // 1. Local reorder
      const newColumns = reorder(board.columns, source.index, destination.index);

      // 2. Assign new sparse positions
      const updatedColumns = newColumns.map((col, idx) => ({
        ...col,
        position: (idx + 1) * 1000,
      }));

      setBoard(prev => ({ ...prev, columns: updatedColumns }));

      // 3. Persist
      for (const col of updatedColumns) {
        await updateColumn({
          variables: { id: col.id, patch: { position: col.position } },
        });
      }
      return;
    }

    if (type === "card") {
      const startCol = board.columns.find(c => c.id === source.droppableId);
      const endCol = board.columns.find(c => c.id === destination.droppableId);
      if (!startCol || !endCol) return;

      // Clone for mutation
      const updatedBoard = { ...board, columns: structuredClone(board.columns) };

      const sourceColumn = updatedBoard.columns.find(c => c.id === startCol.id)!;
      const destinationColumn = updatedBoard.columns.find(c => c.id === endCol.id)!;

      const movedCard = sourceColumn.cards[source.index];

      sourceColumn.cards.splice(source.index, 1);
      destinationColumn.cards.splice(destination.index, 0, movedCard);

      // Reassign positions in both columns
      const updateCards = (cards: Card[]) => cards.map((card, idx) => ({ ...card, position: (idx + 1) * 1000 }));

      sourceColumn.cards = updateCards(sourceColumn.cards);
      destinationColumn.cards = updateCards(destinationColumn.cards);

      setBoard(updatedBoard);

      // Persist
      for (const card of sourceColumn.cards) {
        await updateCard({
          variables: { id: card.id, patch: { position: card.position } },
        });
      }
      for (const card of destinationColumn.cards) {
        await updateCard({
          variables: {
            id: card.id,
            patch: { position: card.position, column_id: destinationColumn.id },
          },
        });
      }
    }
  };

  const handleCreateCard = async (title: string, columnId: string) => {
    const column = board.columns.find(col => col.id === columnId);
    if (!column) return;
    const last = column.cards[column.cards.length - 1];
    const newPos = last ? last.position + 1000 : 1000;

    // Optimistic UI update: update local state immediately
    const tempId = `temp-id${Date.now()}`;
    const newCard: Card = {
      id: tempId,
      position: newPos,
      title,
      description: null, // Ensure description is included
      card_labels: [],
    };

    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.map(col => (col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col));
      return { ...prevBoard, columns: updatedColumns };
    });

    try {
      // Send the mutation to the server
      const { data } = await createCard({
        variables: { column_id: columnId, title, position: newPos },
      });

      // Update the local state with the real ID from the server
      if (data?.insert_cards_one) {
        setBoard(prevBoard => {
          const updatedColumns = prevBoard.columns.map(col =>
            col.id === columnId
              ? {
                  ...col,
                  cards: col.cards.map(card => (card.id === tempId ? { ...card, id: data.insert_cards_one!.id } : card)),
                }
              : col
          );
          return { ...prevBoard, columns: updatedColumns };
        });
      }
    } catch (error) {
      console.error("Error creating card:", error);
      // Revert the optimistic update on failure
      setBoard(prevBoard => {
        const updatedColumns = prevBoard.columns.map(col =>
          col.id === columnId ? { ...col, cards: col.cards.filter(card => card.id !== tempId) } : col
        );
        return { ...prevBoard, columns: updatedColumns };
      });
    }
  };

  const handleDeleteCard = async (cardId: string, columnId: string) => {
    // Optimistic UI update: remove card from local state immediately
    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.map(col =>
        col.id === columnId ? { ...col, cards: col.cards.filter(card => card.id !== cardId) } : col
      );
      return { ...prevBoard, columns: updatedColumns };
    });

    try {
      await deleteCard({ variables: { id: cardId } });
    } catch (error) {
      console.error("Error deleting card:", error);
      // Revert the optimistic update on failure
      // NOTE: The subscription will eventually correct the state anyway.
    }
  };

  // Inside BoardView.tsx, with the other handler functions
  const handleDeleteColumn = async (columnId: string) => {
    if (!window.confirm("Are you sure you want to delete this column and all its cards?")) {
      return;
    }

    // Optimistic UI update: remove column from local state immediately
    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.filter(col => col.id !== columnId);
      return { ...prevBoard, columns: updatedColumns };
    });

    try {
      await deleteColumn({ variables: { id: columnId } });
    } catch (error) {
      console.error("Error deleting column:", error);
      // The subscription will eventually correct the state on failure
    }
  };

  const handleUpdateColumn = async (columnId: string, newName: string) => {
    // Optimistic UI update: Update local state immediately
    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.map(col => (col.id === columnId ? { ...col, name: newName } : col));
      return { ...prevBoard, columns: updatedColumns };
    });

    try {
      // Send the mutation to the server
      await updateColumn({
        variables: { id: columnId, patch: { name: newName } },
      });
    } catch (error) {
      console.error("Error updating column name:", error);
      // The subscription will eventually correct the state if the update fails.
    }
  };

  const handleUpdateCard = async (cardId: string, columnId: string, update: { title?: string; description?: string | null }) => {
    // Optimistic UI update: Update local state immediately

    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.map(col =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map(card => (card.id === cardId ? { ...card, ...update } : card)),
            }
          : col
      );
      return { ...prevBoard, columns: updatedColumns };
    });

    try {
      await updateCard({
        variables: { id: cardId, patch: update },
      });
    } catch (error) {
      console.error("Error updating card:", error);
      // The subscription will eventually correct the state if the update fails.
    }
  };

  const handleColumnConfirmAdd = async () => {
    if (!name.trim()) return;

    // 1. Optimistically create the new column with a temporary ID
    const tempId = `temp-column-${Date.now()}`;
    const newPosition = board.columns.length > 0 ? board.columns[board.columns.length - 1].position + 1 : 1;
    const newColumn = {
      id: tempId,
      name,
      position: newPosition,
      cards: [],
    };

    setBoard(prevBoard => ({
      ...prevBoard,
      columns: [...prevBoard.columns, newColumn],
    }));

    setName("");
    setShowInput(false);

    try {
      // 2. Call the mutation to create the real column in the database
      const { data } = await createColumn({
        variables: {
          board_id: board.id,
          name: newColumn.name,
          position: newColumn.position,
        },
      });

      const newColumnId = data?.insert_columns_one?.id;

      if (newColumnId) {
        // 3. Update the state with the real ID from the server
        handleUpdateColumnId(tempId, newColumnId);
      } else {
        throw new Error("Could not create a new column");
      }
    } catch (error) {
      console.error("Error creating column:", error);
    }
  };

  // Function to handle optimistic creation of a new label
  const handleCreateLabelOptimistic = (name: string, color: string, columnId: string, cardId: string, tempId: string) => {
    const newLabel = {
      __typename: "card_labels",
      card_id: cardId,
      label: {
        __typename: "labels",
        id: tempId,
        name,
        color,
      },
    };
    setBoard(prevBoard => {
      // Assuming you have the columnId and cardId where the new label should be added
      const updatedColumns = prevBoard.columns.map(column => {
        // Check if this is the column we want to update
        if (column.id === columnId) {
          const updatedCards = column.cards.map(card => {
            // Check if this is the card we want to update
            if (card.id === cardId) {
              // Add the new label to the card's card_labels
              return {
                ...card,
                card_labels: [...(card.card_labels || []), newLabel],
              };
            }
            return card; // Return the card unchanged if it's not the one we want to update
          });
          return {
            ...column,
            cards: updatedCards, // Update the cards in this column
          };
        }
        return column; // Return the column unchanged if it's not the one we want to update
      });

      // Return the updated board with the modified columns
      return {
        ...prevBoard,
        columns: updatedColumns,
        labels: [...(prevBoard.labels || []), newLabel.label],
      };
    });
    return tempId; // Return the temporary ID for the mutation
  };

  // Function to handle optimistic assignment of a label to a card
  const handleAssignLabelOptimistic = (cardId: string, labelId: string, labelName: string, labelColor: string) => {
    setBoard((prevBoard: Board) => {
      const updatedColumns = prevBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => {
          if (card.id === cardId) {
            const newAssignedLabel = {
              card_id: card.id,
              label: {
                id: labelId,
                name: labelName,
                color: labelColor,
              },
            };
            return {
              ...card,
              card_labels: [...(card.card_labels || []), newAssignedLabel],
            };
          }
          return card;
        }),
      }));
      return { ...prevBoard, columns: updatedColumns };
    });
  };

  const handleRemoveLabelOptimistic = (cardId: string, labelId: string) => {
    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => {
          if (card.id === cardId) {
            return {
              ...card,
              card_labels:
                card.card_labels?.filter(
                  (assignedLabel: { label: { id: string; name: string; color: string } }) => assignedLabel.label.id !== labelId
                ) ?? [],
            };
          }
          return card;
        }),
      }));
      return { ...prevBoard, columns: updatedColumns };
    });
  };

  const handleDeleteLabelOptimistic = (labelId: string) => {
    setBoard(prevBoard => {
      // 1. Filter out the label from the top-level 'labels' array
      const updatedLabels = prevBoard.labels?.filter(label => label.id !== labelId) ?? [];

      // 2. Filter the label from every card it is assigned to.
      const updatedColumns = prevBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => ({
          ...card,
          card_labels:
            card.card_labels?.filter(
              (assignedLabel: { label: { id: string; name: string; color: string } }) => assignedLabel.label.id !== labelId
            ) ?? [],
        })),
      }));

      // 3. Return the updated board with the modified columns and labels
      return {
        ...prevBoard,
        columns: updatedColumns,
        labels: updatedLabels,
      };
    });
  };

  return (
    <section className="p-4 grow">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex w-full gap-2 items-center">
            <Input
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUpdateBoard()}
            />
            <Button onClick={handleUpdateBoard}>Save</Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center w-full justify-between">
            <h2 className="text-xl font-semibold">{board.name}</h2>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsEditing(true)} variant="ghost" className="text-gray-400 hover:text-blue-500 p-2 h-auto">
                <Pencil className="h-5 w-5" />
              </Button>
              <Button onClick={handleDeleteLocalBoard} variant="ghost" className="text-gray-400 hover:text-red-500 p-2 h-auto">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="column">
          {provided => (
            <div className="flex overflow-x-auto pb-2 pt-1" ref={provided.innerRef} {...provided.droppableProps}>
              {board.columns.map((col, index) => (
                <Draggable key={col.id} draggableId={col.id} index={index}>
                  {provided => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="min-w-[280px] mx-2">
                      {/* IMPORTANT: use margin not gap here bc gap causes UI issues when used on the above div's parent */}
                      <ColumnView
                        column={col}
                        dragHandleProps={provided.dragHandleProps}
                        onAddCard={handleCreateCard}
                        onDeleteCard={handleDeleteCard}
                        onDeleteColumn={handleDeleteColumn}
                        onUpdateColumn={handleUpdateColumn}
                        onUpdateCard={handleUpdateCard}
                        boardId={board.id}
                        handleCreateLabelOptimistic={handleCreateLabelOptimistic}
                        handleAssignLabelOptimistic={handleAssignLabelOptimistic}
                        handleRemoveLabelOptimistic={handleRemoveLabelOptimistic}
                        handleDeleteLabelOptimistic={handleDeleteLabelOptimistic}
                        allBoardLabels={board.labels}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <div className="min-w-[280px] px-3">
                <div className="flex flex-col gap-2 bg-white">
                  {!showInput ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start bg-gray-100 hover:cursor-pointer text-gray-500 hover:text-blue-500"
                      onClick={() => setShowInput(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add a column
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input placeholder="New column name" value={name} onChange={e => setName(e.target.value)} ref={inputRef} />
                      <Button size="icon" onClick={handleColumnConfirmAdd}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setShowInput(false)} className="text-gray-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </section>
  );
}
