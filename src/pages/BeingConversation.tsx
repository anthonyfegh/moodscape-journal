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
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
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

  // Track the latest being response for display
  useEffect(() => {
    const lastBeingMessage = [...messages].reverse().find(m => m.role === "being");
    if (lastBeingMessage?.content && phase === "responding") {
      setDisplayedResponse(lastBeingMessage.content);
    }
  }, [messages, phase]);

  // Phase transitions based on loading state
  useEffect(() => {
    if (isRecalling) {
      setPhase("processing");
      // Being recalls memories — increase attachment
      setBeingState(prev => ({
        ...prev,
        A: Math.min(1, prev.A + 0.15),
        C: Math.min(1, prev.C + 0.1),
      }));
    } else if (isLoading && !isRecalling) {
      setPhase("responding");
    } else if (!isLoading && phase === "responding") {
      // Finished responding — enter reflection
      setPhase("reflecting");
      setTimeout(() => setPhase("idle"), 8000);
    }
  }, [isLoading, isRecalling, phase]);

  // Update being state based on phase
  useEffect(() => {
    if (phase === "absorbing") {
      // Absorbing user's words — heightened sensitivity
      setBeingState(prev => ({
        ...prev,
        A: Math.min(1, prev.A + 0.2),
        H: Math.min(1, prev.H + 0.1),
        C: Math.min(1, prev.C + 0.15),
      }));
    } else if (phase === "reflecting") {
      // Settling after exchange
      setBeingState(prev => ({
        ...prev,
        A: Math.max(0.2, prev.A - 0.1),
        I: Math.min(1, prev.I + 0.05),
        U: Math.min(1, prev.U + 0.03),
      }));
    }
  }, [phase]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const content = message;
    setLastUserMessage(content);
    setMessage("");
    setDisplayedResponse("");
    
    // Phase: absorbing
    setPhase("absorbing");
    
    // Brief absorption animation before sending
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

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Full-screen Being — the center of everything */}
      <div className="absolute inset-0">
        <BeingCanvas 
          renderState={renderState} 
          className="w-full h-full"
          enableControls={false}
        />
      </div>

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

      {/* Being's response — emerges like breath, not a chat bubble */}
      <AnimatePresence>
        {(phase === "responding" || phase === "reflecting") && displayedResponse && (
          <motion.div
            className="absolute inset-x-0 bottom-32 flex justify-center pointer-events-none px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="max-w-2xl text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <p className="text-white/90 text-lg md:text-xl leading-relaxed font-light">
                {displayedResponse}
              </p>
              
              {/* Subtle mood indicator */}
              <motion.p
                className="text-white/30 text-xs mt-4 tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                feeling {getBeingMood()}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle state — invitation to speak */}
      <AnimatePresence>
        {phase === "idle" && !displayedResponse && (
          <motion.div
            className="absolute inset-0 flex items-end justify-center pb-32 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="text-white/30 text-lg hover:text-white/50 transition-colors cursor-pointer pointer-events-auto"
              onClick={handleStartComposing}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              speak to me
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reflecting state — click to continue */}
      <AnimatePresence>
        {phase === "reflecting" && displayedResponse && (
          <motion.div
            className="absolute bottom-8 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
          >
            <motion.button
              className="text-white/20 text-sm hover:text-white/40 transition-colors"
              onClick={handleStartComposing}
              whileHover={{ scale: 1.05 }}
            >
              continue
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composing state — minimal input */}
      <AnimatePresence>
        {phase === "composing" && (
          <motion.div
            className="absolute inset-x-0 bottom-0 p-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-2xl mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                className="w-full bg-transparent border-none text-white text-xl md:text-2xl text-center placeholder:text-white/20 focus:outline-none focus:ring-0"
                autoFocus
              />
              
              <div className="flex justify-center gap-8 mt-6">
                <button
                  onClick={() => setPhase("idle")}
                  className="text-white/30 text-sm hover:text-white/50 transition-colors"
                >
                  cancel
                </button>
                {message.trim() && (
                  <motion.button
                    onClick={handleSend}
                    className="text-white/60 text-sm hover:text-white/80 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    send
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
