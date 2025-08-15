"use client";

import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import CardDetailsModal from "./CardDetailsModal";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const UPDATE_CARD = gql`
  mutation UpdateCard($id: uuid!, $patch: cards_set_input!) {
    update_cards_by_pk(pk_columns: { id: $id }, _set: $patch) {
      id
      title
      position
      description
      column_id
    }
  }
`;

const DELETE_CARD = gql`
  mutation DeleteCard($id: uuid!) {
    delete_cards_by_pk(id: $id) {
      id
    }
  }
`;

export default function CardView({ card, column }: { card: any; column: any }) {
  const [updateCard] = useMutation(UPDATE_CARD);
  const [deleteCard] = useMutation(DELETE_CARD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState(card.title);

  const onDragStart = (e: React.DragEvent) => {
    const payload = { cardId: card.id, sourceColumnId: column.id };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      await deleteCard({ variables: { id: card.id } });
    }
  };

  return (
    <>
      <div draggable onDragStart={onDragStart} className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50" data-card-id={card.id} onClick={() => setIsModalOpen(true)}>
        <div className="font-medium">{card.title}</div>
        {card.description && <div className="text-sm text-gray-500 line-clamp-2">{card.description}</div>}
        <div className="flex gap-2 mt-2">
          <Button onClick={handleDelete} variant="ghost" className="text-gray-400 hover:text-red-500 p-2 h-auto">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {isModalOpen && <CardDetailsModal card={card} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
