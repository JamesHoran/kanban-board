"use client";

import { gql, useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const UPDATE_CARD = gql`
  mutation UpdateCard($id: uuid!, $patch: cards_set_input!) {
    update_cards_by_pk(pk_columns: { id: $id }, _set: $patch) {
      id
      title
      description
    }
  }
`;

interface CardDetailsModalProps {
  card: {
    id: string;
    title: string;
    description?: string;
  };
  onClose: () => void;
}

export default function CardDetailsModal({ card, onClose }: CardDetailsModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [updateCard] = useMutation(UPDATE_CARD);

  // Synchronize state with the 'card' prop
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || "");
  }, [card]);

  const handleSave = async () => {
    const patch = {
      title,
      description,
    };
    await updateCard({ variables: { id: card.id, patch } });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>Make changes to your card here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 min-h-[100px]" />
          </div>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
