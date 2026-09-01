import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { Plus, Users, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatRoomView from "./ChatRoomView";
import { useAuth } from '@/lib/AuthContext';

export default function ChatRooms() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const { data: chatrooms = [] } = useQuery({
    queryKey: ["chatrooms"],
    queryFn: async () => {
      const res = await apiClient.get("/chatrooms");
      return res.data;
    },
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post("/chatrooms", data);
      return res.data;
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      setDialogOpen(false);
      setForm({ name: "", description: "" });
      setSelectedRoomId(room._id);
    },
  });

  const selectedRoom = chatrooms.find((r) => r._id === selectedRoomId);

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Chatrooms
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 border border-primary/40 text-primary px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Room
        </button>
      </div>

      {chatrooms.length === 0 ? (
        <div className="border border-dashed border-border/40 rounded-sm p-8 text-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            No chatrooms yet. Create one to start teaching or studying.
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create Chatroom
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border border-border/40 rounded-sm overflow-hidden">
          {/* List */}
          <div className="lg:col-span-1 border-r border-border/40 max-h-[450px] overflow-y-auto">
            {chatrooms.map((room) => {
              const isGroup = room.type === "group";
              const isSelected = room._id === selectedRoomId;
              return (
                <button
                  key={room._id}
                  onClick={() => setSelectedRoomId(room._id)}
                  className={`w-full flex items-center gap-3 p-4 text-left border-b border-border/30 transition-colors ${
                    isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 ${
                      isGroup ? "bg-primary/10" : "bg-blue-500/10"
                    }`}
                  >
                    {isGroup ? (
                      <Users className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{room.name}</p>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {isGroup ? "Group" : "Individual"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chat view */}
          <div className="lg:col-span-2">
            <ChatRoomView room={selectedRoom} currentUser={currentUser} />
          </div>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Create Chatroom
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <Input
              placeholder="Chatroom name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
