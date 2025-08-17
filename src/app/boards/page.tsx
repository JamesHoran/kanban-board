"use client";

import { useState, useEffect } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus } from "lucide-react";
import BoardView from "./BoardView";
import { nhost } from "@/lib/nhost";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Import the generated GraphQL document nodes
import { GetBoardsForUserDocument, CreateBoardDocument } from "@/gql/graphql";

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

interface Board {
  id: string;
  name: string;
  columns: Column[];
}

export default function BoardsPage() {
  // Use the imported document with useSubscription
  const { data, loading, error } = useSubscription(GetBoardsForUserDocument);

  // Use the imported document with useMutation
  const [createBoard] = useMutation(CreateBoardDocument);

  const [name, setName] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [localBoards, setLocalBoards] = useState<Board[]>([]);

  useEffect(() => {
    if (data?.boards) {
      const boards = data.boards;
      const selectedBoardExists = boards.some(board => board.id === selectedBoardId);

      if (!selectedBoardExists && boards.length > 0) {
        setSelectedBoardId(boards[0].id);
      } else if (boards.length === 0) {
        setSelectedBoardId(null);
      }
    }
  }, [data, selectedBoardId]);

  useEffect(() => {
    if (data?.boards) {
      setLocalBoards(data.boards);
      if (!selectedBoardId && data.boards.length > 0) {
        setSelectedBoardId(data.boards[0].id);
      }
    }
  }, [data, selectedBoardId]);

  const handleCreate = async () => {
    const user = nhost.auth.getUser();

    if (!user) {
      console.error("User not authenticated.");
      toast.error("User not authenticated. Please log in.");
      return;
    }

    if (!name.trim()) return;

    // 1. Optimistic UI Update: Create a temporary board and add it to the local state
    const tempId = `temp-${Date.now()}`;
    const newBoard: Board = {
      id: tempId,
      name: name.trim(),
      columns: [],
    };

    setLocalBoards(prevBoards => [...prevBoards, newBoard]);
    setSelectedBoardId(tempId);
    setName("");

    try {
      // 2. Perform the GraphQL mutation
      const { data: mutationData } = await createBoard({
        variables: { name: newBoard.name, owner_id: user.id },
      });

      // 3. On success: Update the temporary board with the real ID from the server
      if (mutationData?.insert_boards_one) {
        const realBoard = mutationData.insert_boards_one;
        setLocalBoards(prevBoards => prevBoards.map(board => (board.id === tempId ? { ...board, id: realBoard.id } : board)));
        setSelectedBoardId(realBoard.id);
      }
    } catch (createError) {
      console.error("Error creating board:", createError);
      // 4. On failure: Revert the local state by removing the temporary board
      setLocalBoards(prevBoards => prevBoards.filter(board => board.id !== tempId));
      setSelectedBoardId(null);
    }
  };

  if (loading) return <p>Loading boards...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // const boards = data?.boards ?? [];
  const boards = localBoards;
  const selectedBoard = boards.find(board => board.id === selectedBoardId);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Boards</h1>
          {boards.length > 0 && (
            <Select onValueChange={setSelectedBoardId} value={selectedBoardId || ""}>
              <SelectTrigger className="w-[180px] border-gray-300 rounded-lg">
                <SelectValue placeholder="Select a board" />
              </SelectTrigger>
              <SelectContent>
                {boards.map(board => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="New board name" className="max-w-xs border-gray-300 rounded-lg focus:ring-blue-500" />
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </header>

      <div className="space-y-6">{selectedBoard ? <BoardView key={selectedBoard.id} initialBoard={selectedBoard} /> : <p className="text-center text-gray-500 mt-12">No boards yet—create one above.</p>}</div>
      <Toaster position="bottom-right" />
    </div>
  );
}
