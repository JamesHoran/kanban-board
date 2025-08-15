"use client";

import { useState } from "react";
import CardView from "./CardView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@apollo/client";
import { Pencil } from "lucide-react"; // Recommended icon library
import { Trash2 } from "lucide-react";

// Import the GraphQL mutation documents from a separate file
import { CreateCardDocument, DeleteColumnDocument, UpdateColumnDocument } from "@/gql/graphql";

export default function ColumnView({ column, boardId }: { column: any; boardId: string }) {
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(column.name);

  // Use the imported GraphQL document nodes with useMutation
  const [createCard] = useMutation(CreateCardDocument);
  const [deleteColumn] = useMutation(DeleteColumnDocument);
  const [updateColumn] = useMutation(UpdateColumnDocument); // Use the new update mutation

  const handleAddCard = async () => {
    if (!title.trim()) return;
    const last = column.cards[column.cards.length - 1];
    const newPos = last ? last.position + 1000.0 : 1000.0;
    await createCard({ variables: { column_id: column.id, title, position: newPos } });
    setTitle("");
  };

  const handleUpdateColumn = async () => {
    if (editedName.trim() === column.name) {
      setIsEditing(false); // No change, just exit edit mode
      return;
    }
    try {
      await updateColumn({ variables: { id: column.id, patch: { name: editedName } } });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating column:", error);
    }
  };

  const handleDeleteColumn = async () => {
    // Add a confirmation dialog to prevent accidental deletion
    if (window.confirm(`Are you sure you want to delete the column "${column.name}"? This will also delete all cards in it.`)) {
      try {
        await deleteColumn({ variables: { id: column.id } });
      } catch (error) {
        console.error("Error deleting column:", error);
      }
    }
  };

  // Drag & Drop targets:
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDropAtEnd = async (e: React.DragEvent) => {
    e.preventDefault();
    const payload = JSON.parse(e.dataTransfer.getData("application/json") || "{}");
    if (!payload?.cardId) return;
    const cardId = payload.cardId as string;
    const last = column.cards[column.cards.length - 1];
    const newPos = last ? last.position + 1000.0 : 1000.0;

    // This part should be updated to use a GraphQL mutation for consistency
    await fetch(`/api/update-card-position`, {
      method: "POST",
      body: JSON.stringify({ id: cardId, column_id: column.id, position: newPos }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <div className="min-w-[280px] bg-gray-100 shadow-md rounded p-3" onDragOver={onDragOver} onDrop={onDropAtEnd}>
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <div className="flex w-full gap-2 items-center">
            <Input
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleUpdateColumn();
              }}
            />
            <Button onClick={handleUpdateColumn}>Save</Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center w-full justify-between">
            <h3 className="font-semibold">{column.name}</h3>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsEditing(true)} variant="ghost" className="text-gray-400 hover:text-blue-500 p-2 h-auto">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button onClick={handleDeleteColumn} variant="ghost" className="text-gray-400 hover:text-red-500 p-2 h-auto">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex flex-col gap-2 mb-3">
          {column.cards.map((card: any) => (
            <CardView key={card.id} card={card} column={column} />
          ))}
        </div>
      )}

      <div className="mt-2">
        <Input value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder="New card title" />
        <Button className="mt-2 w-full" onClick={handleAddCard}>
          Add card
        </Button>
      </div>
    </div>
  );
}
