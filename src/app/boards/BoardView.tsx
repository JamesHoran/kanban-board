"use client";

import { useState } from "react";
import ColumnView from "./ColumnView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@apollo/client";
import { Pencil, Trash2 } from "lucide-react";

// Import the generated GraphQL document nodes for the mutations
import { CreateColumnDocument, DeleteBoardDocument, UpdateBoardDocument } from "@/gql/graphql";

// Define the type for the board and its nested columns
interface Column {
  id: string;
  position: number;
}

interface Board {
  id: string;
  name: string;
  columns: Column[];
}

// Define the props for the BoardView component
interface BoardViewProps {
  board: Board;
}

export default function BoardView({ board }: BoardViewProps) {
  const [name, setName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(board.name);

  // Use the imported document with useMutation for creating a column
  const [createColumn] = useMutation(CreateColumnDocument);

  // Use the imported document with useMutation for deleting a board
  const [deleteBoard] = useMutation(DeleteBoardDocument);

  // Use the new mutation for updating a board
  const [updateBoard] = useMutation(UpdateBoardDocument);

  const handleAddColumn = async () => {
    if (!name.trim()) return;
    // Determine new position: last column position + 1000, or default 1000
    const last = board.columns[board.columns.length - 1];
    const newPos = last ? last.position + 1000.0 : 1000.0;
    await createColumn({ variables: { board_id: board.id, name, position: newPos } });
    setName("");
  };

  const handleUpdateBoard = async () => {
    if (editedName.trim() === board.name) {
      setIsEditing(false);
      return;
    }
    try {
      await updateBoard({ variables: { id: board.id, patch: { name: editedName } } });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating board:", error);
    }
  };

  const handleDeleteBoard = async () => {
    // Note: In a real-world app, you should use a custom modal
    // for confirmation instead of window.confirm() for a better UX.
    const confirmation = true; // Use a modal to get confirmation
    if (confirmation) {
      try {
        await deleteBoard({ variables: { board_id: board.id } });
      } catch (error) {
        console.error("Error deleting board:", error);
      }
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex w-full gap-2 items-center">
            <Input
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleUpdateBoard();
              }}
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
              <Button onClick={handleDeleteBoard} variant="ghost" className="text-gray-400 hover:text-red-500 p-2 h-auto">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {board.columns.map((col: any) => (
          <ColumnView key={col.id} column={col} boardId={board.id} />
        ))}

        <div className="min-w-[280px] p-2">
          <div className="border-dashed border-2 border-gray-200 rounded p-3 flex flex-col gap-2">
            <Input placeholder="New column name" value={name} onChange={e => setName(e.target.value)} />
            <Button onClick={handleAddColumn}>Add column</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
