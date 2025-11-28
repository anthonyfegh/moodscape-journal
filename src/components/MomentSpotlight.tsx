import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface MomentSpotlightProps {
  moodColor: string;
  children: React.ReactNode;
  onMomentClick: () => void;
  onHoverChange: (isHovering: boolean) => void;
}

export const MomentSpotlight = ({ moodColor, children, onMomentClick, onHoverChange }: MomentSpotlightProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onHoverChange(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative cursor-pointer transition-all duration-300 hover:opacity-100 opacity-90 rounded-lg px-3 py-2 -mx-3 -my-2 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onMomentClick}
    >
      {/* Spotlight orb that follows cursor */}
      {isHovering && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            width: 100,
            height: 100,
            marginLeft: 0,
            marginTop: 0,
            background: `radial-gradient(circle, ${moodColor}40 0%, ${moodColor}20 30%, transparent 70%)`,
            borderRadius: "50%",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
