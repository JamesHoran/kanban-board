"use client";

import { useState } from "react";
import CardView from "./CardView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { useBoard } from "./BoardContext";
import { CreateCardDocument } from "@/gql/graphql";
import { useMutation } from "@apollo/client";
import { Card, Column, Label } from "./types";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ColumnViewProps {
  column: Column;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  onAddCard: (title: string, columnId: string) => void;
  onDeleteCard: (cardId: string, columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, newName: string) => void;
  onUpdateCard: (cardId: string, columnId: string, update: { title?: string; description?: string | null }) => void;
  handleCreateLabelOptimistic: (name: string, color: string, columnId: string, cardId: string, tempId: string) => string;
  handleAssignLabelOptimistic: (cardId: string, labelId: string, labelName: string, labelColor: string) => void;
  handleRemoveLabelOptimistic: (cardId: string, labelId: string) => void;
  handleDeleteLabelOptimistic: (labelId: string) => void;
  boardId: string;
  allBoardLabels: Label[];
}

export default function ColumnView({
  column,
  dragHandleProps,
  onDeleteCard,
  onDeleteColumn,
  onUpdateColumn,
  onUpdateCard,
  boardId,
  handleCreateLabelOptimistic,
  handleAssignLabelOptimistic,
  handleRemoveLabelOptimistic,
  handleDeleteLabelOptimistic,
  allBoardLabels,
}: ColumnViewProps) {
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(column.name);
  const { setBoard, handleUpdateCardId } = useBoard();

  const [createCard] = useMutation(CreateCardDocument);

  const handleUpdateColumn = () => {
    if (editedName.trim() === column.name) {
      setIsEditing(false);
      return;
    }
    // Call the parent's handler function
    onUpdateColumn(column.id, editedName.trim());
    setIsEditing(false);
  };

  const handleAddCardClick = async () => {
    if (!title.trim()) {
      toast.error("Please enter a card name.");
      return;
    }

    // 1. Optimistically create the new card with a temporary ID
    const tempId = `temp-card-${Date.now()}`;
    const newCard: Card = {
      id: tempId,
      position: column.cards.length > 0 ? column.cards[column.cards.length - 1].position + 1 : 1,
      title,
      description: null,
      card_labels: [],
    };

    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.map(col => {
        if (col.id === column.id) {
          return {
            ...col,
            cards: [...col.cards, newCard],
          };
        }
        return col;
      });
      return {
        ...prevBoard,
        columns: updatedColumns,
      };
    });

    setTitle("");

    try {
      // 2. Call the mutation to create the real card in the database
      const { data } = await createCard({
        variables: {
          column_id: column.id,
          title: newCard.title,
          position: newCard.position,
        },
      });

      const newCardId = data?.insert_cards_one?.id;

      if (newCardId) {
        // 3. Update the state with the real ID from the server
        handleUpdateCardId(tempId, newCardId);
      } else {
        throw new Error("Could not create a new card");
      }
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };

  return (
    <div className="bg-gray-100 shadow-md rounded p-3 min-w-[280px]">
      <div {...dragHandleProps} className="flex items-center justify-between mb-3">
        {isEditing ? (
          <div className="flex w-full gap-2 items-center">
            <Input
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUpdateColumn()}
              className="min-w-0"
            />
            <Button size="icon" onClick={handleUpdateColumn} className="flex-shrink-0">
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-red-500 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center w-full justify-between">
            <h3 className="font-semibold">{column.name}</h3>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsEditing(true)} variant="ghost" className="text-gray-400 hover:text-blue-500 p-2 h-auto">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button onClick={() => onDeleteColumn(column.id)} variant="ghost" className="text-gray-400 hover:text-red-500 p-2 h-auto">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Droppable droppableId={column.id} type="card">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col mb-3">
            {column.cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                    className="my-1"
                  >
                    <CardView
                      card={card}
                      column={column}
                      onDeleteCard={() => onDeleteCard(card.id, column.id)}
                      onUpdateCard={onUpdateCard}
                      boardId={boardId}
                      handleCreateLabelOptimistic={handleCreateLabelOptimistic}
                      handleAssignLabelOptimistic={handleAssignLabelOptimistic}
                      handleRemoveLabelOptimistic={handleRemoveLabelOptimistic}
                      handleDeleteLabelOptimistic={handleDeleteLabelOptimistic}
                      allBoardLabels={allBoardLabels}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="mt-2">
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="New card title" />
        <Button
          className="mt-2 w-full text-gray-700 bg-gray-300 border border-gray-300 hover:bg-gray-400 transition-colors duration-200"
          onClick={handleAddCardClick}
        >
          <Plus className="h-4 w-4" />
          Add card
        </Button>
      </div>
    </div>
  );
}
