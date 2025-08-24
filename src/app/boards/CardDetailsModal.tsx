"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import LabelPicker from "./LabelPicker";
import { Card, Column, Label } from "./types"; // Import Card and Column from types.ts

interface CardDetailsModalProps {
  card: Card;
  column: Column;
  onClose: () => void;
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
  const [due_date, setdue_date] = useState(card.due_date || "");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || "");
    setdue_date(card.due_date || "");
  }, [card]);

  const handleSave = () => {
    onUpdateCard(card.id, column.id, { title, description, due_date: due_date || null });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>Make changes to your card here. Click save when you&apos;re done.</DialogDescription>
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
              <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 min-h-[200px]" />
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={due_date ? due_date.split("T")[0] : ""}
                onChange={e => setdue_date(e.target.value)}
                className="mt-1"
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
