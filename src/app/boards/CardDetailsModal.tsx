"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface CardDetailsModalProps {
  card: {
    id: string;
    position: number;
    title: string;
    description?: string | null;
  };
  column: Column;
  onClose: () => void;
  onUpdateCard: (cardId: string, columnId: string, update: { title?: string; description?: string | null }) => void;
}

export default function CardDetailsModal({ card, column, onClose, onUpdateCard }: CardDetailsModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");

  // Synchronize state with the 'card' prop
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || "");
  }, [card]);

  const handleSave = async () => {
    onUpdateCard(card.id, column.id, { title: title, description: description });
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
