import React, { useState, useEffect, useRef } from "react";
import apiClient from "@/api/apiClient";
import { Send, Users, User, MessageSquare } from "lucide-react";
import { io } from "socket.io-client";

export default function ChatRoomView({ room, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!room) {
      setMessages([]);
      return;
    }

    let mounted = true;

    // Fetch message history
    const fetchHistory = async () => {
      try {
        const res = await apiClient.get(`/chatrooms/${room._id}/messages`);
        if (mounted) setMessages(res.data);
      } catch (err) {
        console.error("Failed to load message history:", err);
      }
    };
    fetchHistory();

    // Initialize Socket.io connection
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    socketRef.current = io(backendUrl);

    socketRef.current.on('connect', () => {
      // Join the specific socket room
      socketRef.current.emit('joinRoom', room._id);
    });

    // Listen for incoming messages
    socketRef.current.on('receiveMessage', (message) => {
      if (mounted) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', room._id);
        socketRef.current.disconnect();
      }
    };
  }, [room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");

    try {
      // Post to backend API, which will broadcast via socket.io
      await apiClient.post(`/chatrooms/${room._id}/messages`, {
        content,
        author_name: currentUser?.displayName || currentUser?.email?.split('@')[0] || "Anonymous",
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-center p-6">
        <div>
          <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Select a chatroom to start chatting
          </p>
        </div>
      </div>
    );
  }

  const isGroup = room.type === "group";
  const currentUserName = currentUser?.displayName || currentUser?.email?.split('@')[0] || "Anonymous";

  return (
    <div className="flex flex-col h-full min-h-[450px]">
      {/* Room header */}
      <div className="border-b border-border/40 p-4 flex items-center gap-3">
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
        <div>
          <h3 className="font-display text-sm font-semibold">{room.name}</h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {isGroup ? "Group Chat" : "1-on-1 Chat"}
            {room.description ? ` · ${room.description}` : ""}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.author_id === currentUser?.uid;
            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {!isOwn && (
                    <span className="text-[10px] text-muted-foreground mb-0.5 ml-1">
                      {msg.author_name}
                    </span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-sm text-sm ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-border/40 p-3 flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border border-border/40 rounded-sm px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-primary text-primary-foreground p-2 px-4 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
