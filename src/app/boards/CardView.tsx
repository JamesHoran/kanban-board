"use client";

import { useState } from "react";
import CardDetailsModal from "./CardDetailsModal";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface CardViewProps {
  card: Card;
  column: Column;
  onDeleteCard: () => void;
  onUpdateCard: (cardId: string, columnId: string, update: { title?: string; description?: string | null }) => void;
}

export default function CardView({ card, column, onDeleteCard, onUpdateCard }: CardViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState(card.title);

  const onCardDragStart = (e: React.DragEvent) => {
    e.stopPropagation(); // prevents column drag
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "card", cardId: card.id, fromColumnId: column.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      <div draggable onDragStart={onCardDragStart} className="p-2 bg-white rounded shadow cursor-move" onClick={() => setIsModalOpen(true)}>
        <div className="font-medium">{card.title}</div>
        {card.description && <div className="text-sm text-gray-500 line-clamp-2">{card.description}</div>}
        <div className="flex gap-2 mt-2">
          {/* <Button onClick={handleDelete} variant="ghost" className="text-gray-400 hover:text-red-500 p-2 h-auto"> */}
          <Button onClick={onDeleteCard} variant="ghost" className="text-gray-400 hover:text-red-500 p-2 h-auto">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {isModalOpen && <CardDetailsModal column={column} card={card} onClose={() => setIsModalOpen(false)} onUpdateCard={onUpdateCard} />}
    </>
  );
}
