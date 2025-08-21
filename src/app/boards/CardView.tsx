"use client";

import { useState } from "react";
import CardDetailsModal from "./CardDetailsModal";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Column, CardLabel, Label } from "./types";

interface CardViewProps {
  card: Card;
  column: Column;
  onDeleteCard: () => void;
  onUpdateCard: (cardId: string, columnId: string, update: { title?: string; description?: string | null }) => void;
  boardId: string;
  handleCreateLabelOptimistic: (name: string, color: string, columnId: string, cardId: string, tempId: string) => string;
  handleAssignLabelOptimistic: (cardId: string, labelId: string, labelName: string, labelColor: string) => void;
  handleRemoveLabelOptimistic: (cardId: string, labelId: string) => void;
  handleDeleteLabelOptimistic: (labelId: string) => void;
  allBoardLabels: Label[];
}

export default function CardView({
  card,
  column,
  onDeleteCard,
  onUpdateCard,
  boardId,
  handleCreateLabelOptimistic,
  handleAssignLabelOptimistic,
  handleRemoveLabelOptimistic,
  handleDeleteLabelOptimistic,
  allBoardLabels,
}: CardViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onCardDragStart = (e: React.DragEvent) => {
    e.stopPropagation(); // prevents column drag
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "card", cardId: card.id, fromColumnId: column.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const descriptionCharacterLimit = 500;
  const TitleCharacterLimit = 33;

  return (
    <>
      <div draggable onDragStart={onCardDragStart} className="p-2 bg-white rounded shadow cursor-move" onClick={() => setIsModalOpen(true)}>
        <div className="font-medium">
          {((card: Card) => {
            const truncatedText = card.title
              ? card.title.length > TitleCharacterLimit
                ? `${card.title.substring(0, TitleCharacterLimit)}...`
                : card.title
              : "";
            return truncatedText;
          })(card)}
        </div>
        {card.description && (
          <p className="text-sm text-gray-500 line-clamp-5 mb-2 whitespace-pre-line">
            {((card: Card) => {
              const truncatedText = card.description
                ? card.description.length > descriptionCharacterLimit
                  ? `${card.description.substring(0, descriptionCharacterLimit)}...`
                  : card.description
                : "";
              return truncatedText;
            })(card)}
          </p>
        )}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {card.card_labels?.map((label: CardLabel) => (
              <span
                key={"card" + label.label.id}
                className="px-2 py-0.5 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: label.label.color }}
              >
                {label.label.name}
              </span>
            ))}
          </div>
          <div>
            <Button onClick={onDeleteCard} variant="ghost" className="text-gray-400 hover:text-red-500 p-2 h-auto">
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <CardDetailsModal
          column={column}
          card={card}
          onClose={() => setIsModalOpen(false)}
          onUpdateCard={onUpdateCard}
          boardId={boardId}
          handleCreateLabelOptimistic={handleCreateLabelOptimistic}
          handleAssignLabelOptimistic={handleAssignLabelOptimistic}
          handleRemoveLabelOptimistic={handleRemoveLabelOptimistic}
          handleDeleteLabelOptimistic={handleDeleteLabelOptimistic}
          allBoardLabels={allBoardLabels}
        />
      )}
    </>
  );
}
