import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, Send, X } from "lucide-react";
import { api } from "../services/api";

export function DirectChat({ 
  interventionId, 
  currentUserRole 
}: { 
  interventionId: number, 
  currentUserRole: 'patient' | 'doctor' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (isOpen) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000); // Polling every 3s
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await api.get<any[]>(`/messages?interventionId=${interventionId}`);
      // Postgres returns them ordered by default if we don't specify, but let's assume they are somewhat ordered
      // Actually Supabase might return them based on insertion order. 
      setMessages(data || []);
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const msg = {
      interventionId,
      senderRole: currentUserRole,
      content: newMessage,
    };
    
    try {
      await api.post('/messages', msg);
      setNewMessage("");
      fetchMessages(); // refresh instantly
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-105 transition-all p-0 z-50 flex items-center justify-center"
        >
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Discussion directe</h3>
                <p className="text-indigo-100 text-xs">
                  {currentUserRole === 'patient' ? 'Avec votre médecin' : 'Avec le patient'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 p-4 bg-slate-50 min-h-[300px] max-h-[400px] overflow-y-auto flex flex-col gap-3"
          >
            {messages.length === 0 ? (
              <div className="m-auto text-center text-slate-400 text-sm p-4">
                Envoyez un message pour commencer la discussion.
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.senderRole === currentUserRole;
                return (
                  <div key={m.id || idx} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                      {isMe ? 'Moi' : m.senderRole === 'doctor' ? 'Médecin' : 'Patient'}
                    </span>
                    <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                      isMe 
                        ? 'bg-indigo-500 text-white rounded-br-sm' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez un message..."
              className="flex-1 bg-slate-50 border-0 focus-visible:ring-indigo-500"
            />
            <Button type="submit" size="icon" className="bg-indigo-500 hover:bg-indigo-600 rounded-xl shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
