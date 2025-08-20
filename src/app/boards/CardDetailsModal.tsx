"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import LabelPicker from "./LabelPicker";

interface Card {
  id: string;
  position: number;
  title: string;
  description?: string | null;
  card_labels: any;
}

interface Column {
  id: string;
  position: number;
  name: string;
  cards: Card[];
}

interface CardDetailsModalProps {
  card: Card;
  column: Column;
  onClose: () => void;
  onUpdateCard: (cardId: string, columnId: string, update: { title?: string; description?: string | null }) => void;
  boardId: string;
  handleCreateLabelOptimistic: any;
  handleAssignLabelOptimistic: any;
  handleRemoveLabelOptimistic: any;
  handleDeleteLabelOptimistic: any;
  allBoardLabels: { id: string; name: string; color: string }[];
}

export default function CardDetailsModal({
  card,
  column,
  onClose,
  onUpdateCard,
  boardId,
  handleCreateLabelOptimistic,
  handleAssignLabelOptimistic,
  handleRemoveLabelOptimistic,
  handleDeleteLabelOptimistic,
  allBoardLabels,
}: CardDetailsModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [activeTab, setActiveTab] = useState("details");

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

        <div className="flex border-b border-gray-200 mt-4 mb-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === "details"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("labels")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === "labels"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Labels
          </button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-1 min-h-[100px]"
                placeholder="Use **bold**, _italic_, or - list items"
              />
            </div>
            <Button onClick={handleSave}>Save changes</Button>
          </div>
        )}

        {activeTab === "labels" && (
          <div className="space-y-4">
            <LabelPicker
              boardId={boardId}
              columnId={column.id}
              cardId={card.id}
              assignedLabels={card.card_labels || []}
              onCreateLabelOptimistic={handleCreateLabelOptimistic}
              onAssignLabelOptimistic={handleAssignLabelOptimistic}
              onRemoveLabelOptimistic={handleRemoveLabelOptimistic}
              onDeleteLabelOptimistic={handleDeleteLabelOptimistic}
              allBoardLabels={allBoardLabels}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
