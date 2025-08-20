"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Board } from "./types";

interface BoardContextType {
  board: Board;
  setBoard: React.Dispatch<React.SetStateAction<Board>>;
  handleUpdateLabelId: (tempId: string, realId: string) => void;
  handleUpdateCardId: (tempId: string, realId: string) => void;
  handleUpdateColumnId: (tempId: string, realId: string) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ initialBoard, children }: { initialBoard: Board; children: ReactNode }) {
  const [board, setBoard] = useState<Board>(initialBoard);

  const handleUpdateLabelId = (tempId: string, realId: string) => {
    setBoard(prevBoard => {
      // 1. Update the top-level 'labels' array
      const updatedLabels = prevBoard.labels.map(label => (label.id === tempId ? { ...label, id: realId } : label));

      // 2. Update the 'card_labels' on the specific card
      const updatedColumns = prevBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => ({
          ...card,
          card_labels: card.card_labels?.map((assignedLabel: any) => (assignedLabel.label.id === tempId ? { ...assignedLabel, label: { ...assignedLabel.label, id: realId } } : assignedLabel)) ?? [],
        })),
      }));

      return {
        ...prevBoard,
        labels: updatedLabels,
        columns: updatedColumns,
      };
    });
  };

  const handleUpdateCardId = (tempId: string, realId: string) => {
    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => (card.id === tempId ? { ...card, id: realId } : card)),
      }));

      return {
        ...prevBoard,
        columns: updatedColumns,
      };
    });
  };

  const handleUpdateColumnId = (tempId: string, realId: string) => {
    setBoard(prevBoard => {
      const updatedColumns = prevBoard.columns.map(column => (column.id === tempId ? { ...column, id: realId } : column));

      return {
        ...prevBoard,
        columns: updatedColumns,
      };
    });
  };

  const value = {
    board,
    setBoard,
    handleUpdateLabelId,
    handleUpdateCardId,
    handleUpdateColumnId, // Add to the context value
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
}
