"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  CreateLabelDocument,
  AssignLabelToCardDocument,
  RemoveLabelFromCardDocument,
  DeleteLabelDocument,
  DeleteCardLabelsByLabelIdDocument,
} from "@/gql/graphql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { CardLabel, Label } from "./types";
import { useBoard } from "./BoardContext";

interface LabelPickerProps {
  boardId: string;
  columnId: string;
  cardId: string;
  assignedLabels: CardLabel[];
  onCreateLabelOptimistic: (name: string, color: string, columnId: string, cardId: string, tempId: string) => string;
  onAssignLabelOptimistic: (cardId: string, labelId: string, labelName: string, labelColor: string) => void;
  onRemoveLabelOptimistic: (cardId: string, labelId: string) => void;
  onDeleteLabelOptimistic: (labelId: string) => void;
  allBoardLabels: Label[];
}

export default function LabelPicker({
  boardId,
  columnId,
  cardId,
  assignedLabels,
  onCreateLabelOptimistic,
  onAssignLabelOptimistic,
  onRemoveLabelOptimistic,
  onDeleteLabelOptimistic,
  allBoardLabels,
}: LabelPickerProps) {
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");

  const [createLabel] = useMutation(CreateLabelDocument);
  const [assignLabelToCard] = useMutation(AssignLabelToCardDocument);
  const [removeLabelFromCard] = useMutation(RemoveLabelFromCardDocument);
  const [deleteLabel] = useMutation(DeleteLabelDocument);
  const [deleteCardLabelsByLabelId] = useMutation(DeleteCardLabelsByLabelIdDocument);
  const { handleUpdateLabelId } = useBoard();

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const tempId = `temp-id-label${Date.now()}`;
      // Optimistically add the new label and get its temporary ID
      onCreateLabelOptimistic(newLabelName, newLabelColor, columnId, cardId, tempId);
      setNewLabelName("");
      setNewLabelColor("#3b82f6");

      const { data: createData } = await createLabel({
        variables: { board_id: boardId, name: newLabelName, color: newLabelColor },
      });

      const newLabelId = createData?.insert_labels_one?.id;

      if (newLabelId) {
        // Update the local state with the real ID
        handleUpdateLabelId(tempId, newLabelId);

        // Assign the label to the card
        await assignLabelToCard({ variables: { card_id: cardId, label_id: newLabelId } });
      } else {
        throw new Error("Could not find new label id to assign the newly created label to a card with");
      }
    } catch (error) {
      console.error("Error creating or assigning label:", error);
      // The subscription will handle the rollback on failure
    }
  };

  const handleToggleLabel = async (labelId: string) => {
    // Check if the label is currently assigned to the card
    const isAssigned = assignedLabels.some(l => l.label.id === labelId);

    if (isAssigned) {
      // Logic for UN-assigning a label
      onRemoveLabelOptimistic(cardId, labelId);
      try {
        await removeLabelFromCard({ variables: { card_id: cardId, label_id: labelId } });
      } catch (error) {
        console.error(`Error removing label ${error}`);
      }
    } else {
      // Logic for ASSIGNING a label
      // Find the label's details from the complete list of board labels
      const labelToAssign = allBoardLabels.find(l => l.id === labelId);

      if (labelToAssign) {
        onAssignLabelOptimistic(cardId, labelId, labelToAssign.name, labelToAssign.color);
        try {
          await assignLabelToCard({ variables: { card_id: cardId, label_id: labelId } });
        } catch (error) {
          console.error(`Error assigning label ${error}`);
        }
      }
    }
  };

  const isLabelAssigned = (labelId: string) => {
    return assignedLabels.some(l => l.label.id === labelId);
  };

  const handleDeleteLabel = async (labelId: string) => {
    onDeleteLabelOptimistic(labelId);

    try {
      await deleteCardLabelsByLabelId({ variables: { label_id: labelId } });
      await deleteLabel({ variables: { id: labelId } });
      // Step 2: Delete the label itself
    } catch (error) {
      console.error("Error deleting label:", error);
      // The subscription will handle the rollback if the mutations fail.
    }
  };

  return (
    <div className="space-y-4">
      {allBoardLabels.length > 0 && (
        <div className="border-b border-gray-200 pb-4">
          <label className="text-sm font-medium text-gray-700">Available Labels</label>

          <div className="flex flex-wrap gap-2 mt-2">
            {allBoardLabels.map((label: Label) => {
              const assigned = isLabelAssigned(label.id);
              return (
                <div key={"button" + label.id} className="relative group">
                  <button
                    onClick={() => handleToggleLabel(label.id)}
                    className="px-2 py-1 hover:cursor-pointer rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: assigned ? label.color : "transparent",
                      color: assigned ? "white" : label.color,
                      border: `1px solid ${label.color}`,
                    }}
                  >
                    {label.name}
                  </button>
                  <button
                    onClick={() => handleDeleteLabel(label.id)}
                    className="absolute top-0 hover:cursor-pointer right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Label"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div>
        <label className="text-sm font-medium text-gray-700">Create New Label</label>
        <div className="flex gap-2 mt-2">
          <Input type="text" placeholder="Label Name" value={newLabelName} onChange={e => setNewLabelName(e.target.value)} />
          <Input type="color" value={newLabelColor} onChange={e => setNewLabelColor(e.target.value)} className="p-1 h-10 w-14" />
        </div>
        <Button onClick={handleCreateLabel} className="w-full mt-2">
          Create
        </Button>
      </div>
    </div>
  );
}
