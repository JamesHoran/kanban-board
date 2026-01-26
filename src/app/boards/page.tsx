"use client";

import { LoadingScreen } from "@/components/onboarding/LoadingScreen";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  CreateBoardDocument,
  DeleteBoardDocument,
  GetBoardsForUserDocument,
} from "@/gql/graphql";
import { useMutation, useSubscription } from "@apollo/client/react";
import { useUserData } from "@nhost/nextjs";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BoardProvider } from "./BoardContext";
import BoardView from "./BoardView";
import { Board } from "./types";

export default function BoardsPage() {
  const userData = useUserData();
  const { data, loading, error } = useSubscription(GetBoardsForUserDocument, {
    skip: !userData,
    variables: { userId: userData?.id }, // Use optional chaining to prevent an error
  });

  const [createBoard] = useMutation(CreateBoardDocument);
  const [deleteBoard] = useMutation(DeleteBoardDocument);

  const [name, setName] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [localBoards, setLocalBoards] = useState<Board[]>([]);
  const [createBoardDialogOpen, setCreateBoardDialogOpen] =
    useState<boolean>(false);

  const selectedBoard = localBoards.find(
    (board) => board.id === selectedBoardId,
  );

  useEffect(() => {
    if (data?.boards) {
      const boards = data.boards;
      const selectedBoardExists = boards.some(
        (board) => board.id === selectedBoardId,
      );

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

  if (!userData) {
    return <LoadingScreen message="Loading page..." />;
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a board name.");
      return;
    }
    if (!userData) return;

    // 1. Optimistically add the new board with a temporary ID
    const tempId = `temp-id-board-${Date.now()}`;
    const newBoard = {
      id: tempId,
      name,
      columns: [],
      labels: [],
    };

    setLocalBoards((prevBoards) => [...prevBoards, newBoard]);
    setName("");
    setSelectedBoardId(tempId); // Select the new board optimistically

    try {
      // 2. Call the mutation to create the real board in the database
      const { data } = await createBoard({
        variables: { name, owner_id: userData.id },
      });

      const newBoardId = data?.insert_boards_one?.id;

      if (newBoardId) {
        // 3. Update the state with the real ID from the server
        setLocalBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.id === tempId ? { ...board, id: newBoardId } : board,
          ),
        );
        setSelectedBoardId(newBoardId); // Select the real ID
        toast.success("Board created successfully!");
      } else {
        throw new Error("Could not create a new board");
      }
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board.");
      // Rollback the optimistic update on error
      setLocalBoards((prevBoards) =>
        prevBoards.filter((board) => board.id !== tempId),
      );
      setSelectedBoardId(null);
    }
  };

  const handleDeleteLocalBoard = async () => {
    if (!selectedBoardId) return;

    const boardToDeleteId = selectedBoardId;
    const previousBoards = localBoards;

    // Optimistically remove the board from the local state
    setLocalBoards((prevBoards) =>
      prevBoards.filter((board) => board.id !== boardToDeleteId),
    );
    setSelectedBoardId(null);

    try {
      if (
        window.confirm(
          "Are you sure you want to delete this board with it's labels, cards, and column?",
        )
      ) {
        await deleteBoard({ variables: { board_id: boardToDeleteId } });
        toast.success("Board deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Failed to delete board. Restoring...");
      // Rollback the optimistic update on error
      setLocalBoards(previousBoards);
      setSelectedBoardId(boardToDeleteId);
    }
  };

  const handleCreateBoardDialog = () => {
    setCreateBoardDialogOpen((state) => !state);
  };

  if (loading) return <LoadingScreen message="Loading page..." />;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="flex flex-col min-h-screen max-w-screen">
      <header className="p-1.5 border border-b-slate-300 shadow shadow-slate-300">
        <div className="flex flex-row justify-between">
          <div>
            {localBoards.length > 0 && (
              <Select
                value={selectedBoardId || ""}
                onValueChange={(value) => setSelectedBoardId(value)}
              >
                <SelectTrigger className="w-[180px] border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  {localBoards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Dialog
              open={createBoardDialogOpen}
              onOpenChange={handleCreateBoardDialog}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Board</DialogTitle>
                  <DialogDescription>
                    What would you like your board called?
                  </DialogDescription>
                </DialogHeader>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  placeholder="New board name"
                  className="flex border-gray-300 rounded-lg focus:ring-blue-500"
                />
                <Button
                  onClick={handleCreate}
                  className="bg-primary hover:bg-primary/85 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Board
                </Button>
              </DialogContent>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/85 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors">
                  <Plus className="h-4 w-4" />
                  Create Board
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="space-y-6 grow flex max-w-screen">
        {selectedBoard ? (
          <BoardProvider key={selectedBoardId} initialBoard={selectedBoard}>
            <BoardView handleDeleteLocalBoard={handleDeleteLocalBoard} />
          </BoardProvider>
        ) : (
          <p className="flex grow justify-center text-gray-500 mt-12">
            No boards yet—create one above.
          </p>
        )}
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
