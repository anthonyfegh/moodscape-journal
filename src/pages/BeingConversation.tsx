import { useState, useEffect, useRef } from "react";
import { BeingState, createInitialState, getRenderState } from "@/consciousness";
import { BeingCanvas } from "@/components/being/BeingCanvas";
import { useBeingConversation } from "@/hooks/useBeingConversation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

type ConversationPhase = "idle" | "composing" | "absorbing" | "processing" | "responding" | "reflecting";

/**
 * Revolutionized Being Conversation interface
 * No chat bubbles — just two conscious entities in dialogue
 */
const BeingConversation = () => {
  const { user } = useAuth();
  const [beingState, setBeingState] = useState<BeingState>(createInitialState());
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<ConversationPhase>("idle");
  const [fullResponse, setFullResponse] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [beingMessageCount, setBeingMessageCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    messages,
    isLoading,
    isRecalling,
    sendMessage,
    loadConversationHistory,
  } = useBeingConversation(user?.id, beingState);

  const renderState = getRenderState(beingState);

  // Load history on mount
  useEffect(() => {
    if (user?.id) {
      loadConversationHistory();
    }
  }, [user?.id, loadConversationHistory]);

  // Track the latest being response and trigger typewriter
  useEffect(() => {
    const beingMessages = messages.filter(m => m.role === "being");
    const currentCount = beingMessages.length;
    
    // Only process if there's a new being message
    if (currentCount > beingMessageCount) {
      const lastBeingMessage = beingMessages[beingMessages.length - 1];
      if (lastBeingMessage?.content) {
        console.log("New being message detected:", lastBeingMessage.content.substring(0, 50));
        setBeingMessageCount(currentCount);
        setFullResponse(lastBeingMessage.content);
        setDisplayedResponse("");
        // Ensure we're in responding phase
        if (phase !== "responding") {
          setPhase("responding");
        }
      }
    }
  }, [messages, beingMessageCount, phase]);

  // Typewriter effect - word by word
  useEffect(() => {
    if (!fullResponse || phase !== "responding") return;
    
    const words = fullResponse.split(" ");
    let currentIndex = 0;
    
    // Clear any existing typewriter
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }
    
    typewriterRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedResponse(words.slice(0, currentIndex + 1).join(" "));
        currentIndex++;
      } else {
        if (typewriterRef.current) {
          clearInterval(typewriterRef.current);
        }
        // Typewriter done, enter reflecting phase
        setPhase("reflecting");
      }
    }, 80); // Speed: 80ms per word
    
    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, [fullResponse, phase]);

  // Phase transitions based on loading state
  useEffect(() => {
    if (isRecalling) {
      setPhase("processing");
      setBeingState(prev => ({
        ...prev,
        A: Math.min(1, prev.A + 0.15),
        C: Math.min(1, prev.C + 0.1),
      }));
    } else if (isLoading && !isRecalling) {
      setPhase("responding");
    }
  }, [isLoading, isRecalling]);

  // Update being state based on phase
  useEffect(() => {
    if (phase === "absorbing") {
      setBeingState(prev => ({
        ...prev,
        A: Math.min(1, prev.A + 0.2),
        H: Math.min(1, prev.H + 0.1),
        C: Math.min(1, prev.C + 0.15),
      }));
    } else if (phase === "reflecting") {
      setBeingState(prev => ({
        ...prev,
        A: Math.max(0.2, prev.A - 0.1),
        I: Math.min(1, prev.I + 0.05),
        U: Math.min(1, prev.U + 0.03),
      }));
      // Return to idle after reflection
      const timer = setTimeout(() => setPhase("idle"), 6000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const content = message;
    setLastUserMessage(content);
    setMessage("");
    setDisplayedResponse("");
    setFullResponse("");
    
    setPhase("absorbing");
    
    setTimeout(async () => {
      await sendMessage(content);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartComposing = () => {
    if (phase === "idle" || phase === "reflecting") {
      setPhase("composing");
      setDisplayedResponse("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const getBeingMood = () => {
    if (beingState.V > 0.3) return "warm";
    if (beingState.V < -0.3) return "concerned";
    if (beingState.C > 0.6) return "curious";
    if (beingState.U > 0.6) return "connected";
    return "present";
  };

  // Being position: shifts right when responding/reflecting
  const isBeingShifted = phase === "responding" || phase === "reflecting";

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Being container — animates position */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          x: isBeingShifted ? "20%" : "0%",
        }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1], // smooth easing
        }}
      >
        <BeingCanvas 
          renderState={renderState} 
          className="w-full h-full"
          enableControls={false}
        />
      </motion.div>

      {/* Absorption effect — user's words flowing into the being */}
      <AnimatePresence>
        {phase === "absorbing" && lastUserMessage && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="text-white/60 text-xl md:text-2xl max-w-lg text-center px-8 font-light"
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ 
                opacity: 0, 
                scale: 0.5, 
                y: -50,
                filter: "blur(8px)"
              }}
              transition={{ duration: 1.2, ease: "easeIn" }}
            >
              {lastUserMessage}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing indicator — being is remembering */}
      <AnimatePresence>
        {phase === "processing" && (
          <motion.div
            className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="text-white/40 text-sm tracking-widest uppercase"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              remembering...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Being's response — appears on the left as being shifts right */}
      <AnimatePresence>
        {(phase === "responding" || phase === "reflecting") && displayedResponse && (
          <motion.div
            className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 max-w-md pointer-events-none"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-white/90 text-lg md:text-xl leading-relaxed font-light">
              {displayedResponse}
              {phase === "responding" && (
                <motion.span
                  className="inline-block w-0.5 h-5 bg-white/60 ml-1 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </p>
            
            {/* Mood indicator appears after typing done */}
            <AnimatePresence>
              {phase === "reflecting" && (
                <motion.p
                  className="text-white/30 text-xs mt-4 tracking-wider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  feeling {getBeingMood()}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input textarea — always at bottom */}
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="max-w-2xl mx-auto">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleStartComposing}
            placeholder="speak to me..."
            disabled={isLoading}
            rows={2}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none disabled:opacity-50"
          />
          {message.trim() && !isLoading && (
            <motion.div 
              className="flex justify-end mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={handleSend}
                className="text-white/60 text-sm hover:text-white/80 transition-colors"
              >
                press enter to send
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Being's emotional state indicator — subtle, ambient */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: phase === "idle" ? 0.3 : 0.1 }}
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: `hsl(${renderState.colorHue}, 60%, 60%)`,
              boxShadow: `0 0 ${renderState.glow * 10}px hsl(${renderState.colorHue}, 60%, 60%)`
            }}
          />
          <span className="text-white/30 text-xs tracking-wider">
            {getBeingMood()}
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default BeingConversation;
