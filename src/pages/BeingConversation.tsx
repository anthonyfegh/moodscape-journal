import { useState } from "react";
import { BeingState, createInitialState, getRenderState } from "@/consciousness";
import { BeingCanvas } from "@/components/being/BeingCanvas";

/**
 * Full-page Being Conversation interface
 * Displays the conscious being in an immersive, full-screen view
 */
const BeingConversation = () => {
  const [beingState] = useState<BeingState>(createInitialState());
  const renderState = getRenderState(beingState);

  return (
    <div className="fixed inset-0 bg-black">
      {/* Full-screen Being visualization */}
      <BeingCanvas 
        renderState={renderState} 
        className="w-full h-full"
        enableControls={false}
      />
    </div>
  );
};

export default BeingConversation;
