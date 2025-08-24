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
  onUpdateCard: (
    cardId: string,
    columnId: string,
    update: { title?: string; description?: string | null; due_date?: string | null }
  ) => void;
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

  const isOverdue = (due_date: string | null | undefined): boolean => {
    if (!due_date) {
      return false;
    }
    const today = new Date();
    const date = new Date(due_date);

    // Set time to midnight to compare dates only
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date < today;
  };

  const descriptionCharacterLimit = 500;
  const TitleCharacterLimit = 33;

  return (
    <>
      <div className="p-2 bg-white rounded shadow cursor-move w-full max-w-2xs" onClick={() => setIsModalOpen(true)}>
        <div className="font-medium mb-3">
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
        <div className="flex flex-wrap gap-1 overflow-hidden max-w-full mb-2">
          {card.card_labels?.map((label: CardLabel) => (
            <span
              key={"card" + label.label.id}
              className="px-2 py-0.5 rounded-full text-white text-xs font-semibold truncate"
              style={{ backgroundColor: label.label.color }}
            >
              {label.label.name}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          {card.due_date ? (
            <div className={`text-xs flex items-center gap-1 ${isOverdue(card.due_date) ? "text-red-500 font-semibold" : "text-gray-500"}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{new Date(card.due_date).toLocaleDateString()}</span>
            </div>
          ) : (
            <div />
          )}
          <div>
            <Button
              onClick={e => {
                e.stopPropagation();
                onDeleteCard();
              }}
              variant="ghost"
              className="text-gray-400 hover:text-red-500 p-2 h-auto"
            >
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
