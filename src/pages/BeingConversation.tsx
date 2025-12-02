import { useState } from "react";
import { BeingState, createInitialState, getRenderState } from "@/consciousness";
import { BeingCanvas } from "@/components/being/BeingCanvas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

/**
 * Full-page Being Conversation interface
 * Displays the conscious being in an immersive, full-screen view
 */
const BeingConversation = () => {
  const [beingState] = useState<BeingState>(createInitialState());
  const [message, setMessage] = useState("");
  const renderState = getRenderState(beingState);

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Send message to being
    console.log("Sending message:", message);
    setMessage("");
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
      <div className="flex-1">
        <BeingCanvas 
          renderState={renderState} 
          className="w-full h-full"
          enableControls={false}
        />
      </div>

      {/* Input area at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3 items-center bg-background/10 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something to the being..."
              className="flex-1 bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              size="icon"
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeingConversation;
