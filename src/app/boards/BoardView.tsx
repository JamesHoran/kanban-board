"use client";

import { useState } from "react";
import ColumnView from "./ColumnView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@apollo/client";
import { Pencil, Trash2 } from "lucide-react";
import { CreateColumnDocument, DeleteBoardDocument, UpdateBoardDocument, UpdateColumnDocument, UpdateCardDocument, CreateCardDocument, DeleteCardDocument, DeleteColumnDocument } from "@/gql/graphql";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Card {
  id: string;
  position: number;
  title: string;
  description?: string | null;
}

interface Column {
  id: string;
  position: number;
  name: string;
  cards: Card[];
}

interface Board {
  id: string;
  name: string;
  columns: Column[];
}

interface BoardViewProps {
  initialBoard: Board;
}

export default function BoardView({ initialBoard }: BoardViewProps) {
  if (!initialBoard) {
    return null; // or a loading spinner
  }

  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(initialBoard.name);
  const [board, setBoard] = useState<Board>(initialBoard);

  const [createColumn] = useMutation(CreateColumnDocument);
  const [deleteBoard] = useMutation(DeleteBoardDocument);
  const [updateBoard] = useMutation(UpdateBoardDocument);
  const [updateColumn] = useMutation(UpdateColumnDocument);
  const [deleteColumn] = useMutation(DeleteColumnDocument);
  const [updateCard] = useMutation(UpdateCardDocument);
  const [createCard] = useMutation(CreateCardDocument);
  const [deleteCard] = useMutation(DeleteCardDocument);

  const handleAddColumn = async () => {
    if (!name.trim()) return;
    const last = board.columns[board.columns.length - 1];
    const newPos = last ? last.position + 1000 : 1000;

    await createColumn({
      variables: { board_id: board.id, name, position: newPos },
    }).then(response => {
      // Check if the mutation was successful and data was returned
      if (response?.data?.insert_columns_one) {
        const newColumnData = response.data.insert_columns_one;
        const newColumn: Column = { ...newColumnData, cards: [] };
        // Update the local state with the new column
        setBoard(prevBoard => ({
          ...prevBoard,
          columns: [...prevBoard.columns, newColumn],
        }));
      }
    });

    setName("");
  };

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

  const handleDeleteBoard = async () => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      await deleteBoard({ variables: { board_id: board.id } });
    }
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

      let movedCard = sourceColumn.cards[source.index];

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
    const tempId = `temp-${Date.now()}`;
    const newCard: Card = {
      id: tempId,
      position: newPos,
      title,
      description: null, // Ensure description is included
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
        const updatedColumns = prevBoard.columns.map(col => (col.id === columnId ? { ...col, cards: col.cards.filter(card => card.id !== tempId) } : col));
        return { ...prevBoard, columns: updatedColumns };
      });
    }
  };

  const handleDeleteCard = async (cardId: string, columnId: string) => {
    // Optimistic UI update: remove card from local state immediately
    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.map(col => (col.id === columnId ? { ...col, cards: col.cards.filter(card => card.id !== cardId) } : col));
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

  return (
    <section className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex w-full gap-2 items-center">
            <Input value={editedName} onChange={e => setEditedName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleUpdateBoard()} />
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
              <Button onClick={handleDeleteBoard} variant="ghost" className="text-gray-400 hover:text-red-500 p-2 h-auto">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="column">
          {provided => (
            <div className="flex overflow-x-auto pb-2" ref={provided.innerRef} {...provided.droppableProps}>
              {board.columns.map((col, index) => (
                <Draggable key={col.id} draggableId={col.id} index={index}>
                  {provided => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="min-w-[280px] mx-2">
                      {/* IMPORTANT: use margin not gap here bc gap causes UI issues when used on the above div's parent */}
                      <ColumnView column={col} dragHandleProps={provided.dragHandleProps} onAddCard={handleCreateCard} onDeleteCard={handleDeleteCard} onDeleteColumn={handleDeleteColumn} onUpdateColumn={handleUpdateColumn} onUpdateCard={handleUpdateCard} />
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}

              <div className="min-w-[280px] p-2">
                <div className="border-dashed border-2 border-gray-200 rounded p-3 flex flex-col gap-2">
                  <Input placeholder="New column name" value={name} onChange={e => setName(e.target.value)} />
                  <Button onClick={handleAddColumn}>Add column</Button>
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </section>
  );
}
