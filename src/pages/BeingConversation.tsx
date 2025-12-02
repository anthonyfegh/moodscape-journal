import { useState, useEffect, useRef } from "react";
import { BeingState, createInitialState, getRenderState } from "@/consciousness";
import { BeingCanvas } from "@/components/being/BeingCanvas";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useBeingConversation } from "@/hooks/useBeingConversation";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Full-page Being Conversation interface
 * The being manages memories like a living mind — no folders, no menus
 */
const BeingConversation = () => {
  const { user } = useAuth();
  const [beingState, setBeingState] = useState<BeingState>(createInitialState());
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    isLoading,
    isRecalling,
    sendMessage,
    loadConversationHistory,
  } = useBeingConversation(user?.id, beingState);

  const renderState = getRenderState(beingState);

  // Load conversation history on mount
  useEffect(() => {
    if (user?.id) {
      loadConversationHistory();
    }
  }, [user?.id, loadConversationHistory]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update being state based on conversation
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        // Increase arousal and curiosity when user is engaged
        setBeingState(prev => ({
          ...prev,
          A: Math.min(1, prev.A + 0.1),
          C: Math.min(1, prev.C + 0.05),
        }));
      } else if (lastMessage.role === "being" && lastMessage.recalledMemories?.length) {
        // Strengthen attachment when memories are recalled
        setBeingState(prev => ({
          ...prev,
          U: Math.min(1, prev.U + 0.05),
          K: Math.min(1, prev.K + 0.02),
        }));
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    const content = message;
    setMessage("");
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Full-screen Being visualization */}
      <div className="flex-1 relative">
        <BeingCanvas 
          renderState={renderState} 
          className="w-full h-full"
          enableControls={false}
        />

        {/* Conversation overlay */}
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          {/* Messages area */}
          <div className="flex-1 flex items-end justify-center pb-4 pointer-events-auto">
            <ScrollArea className="max-w-2xl w-full max-h-[60vh] px-6">
              <div className="space-y-4 py-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-white/10 backdrop-blur-xl text-white"
                          : "bg-white/5 backdrop-blur-xl text-white/90 border border-white/10"
                      }`}
                    >
                      {msg.content || (
                        <span className="flex items-center gap-2 text-white/50">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isRecalling ? "Remembering..." : "Thinking..."}
                        </span>
                      )}
                      
                      {/* Show recalled memories indicator */}
                      {msg.role === "being" && msg.recalledMemories && msg.recalledMemories.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/40">
                          {msg.recalledMemories.length} {msg.recalledMemories.length === 1 ? "memory" : "memories"} recalled
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center text-white/40 py-12">
                    <p className="text-lg mb-2">Hello.</p>
                    <p className="text-sm">I remember everything you've written.</p>
                    <p className="text-sm">What's on your mind?</p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Input area at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3 items-end bg-background/10 backdrop-blur-xl rounded-2xl p-3 border border-white/10">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something to the being..."
              className="flex-1 bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[44px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              size="icon"
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeingConversation;
