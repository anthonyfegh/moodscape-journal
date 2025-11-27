import { useEffect, useState } from "react";
import { Brain } from "lucide-react";

interface MemoryBubblesProps {
  memory: string | null;
}

export const MemoryBubbles = ({ memory }: MemoryBubblesProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (memory) {
      setIsVisible(true);
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [memory]);

  if (!memory || !isVisible) return null;

  return (
    <div className="absolute bottom-20 left-4 max-w-sm">
      <div
        className="
          bg-accent/90 backdrop-blur-sm border border-accent-foreground/20 rounded-lg p-4 shadow-xl
          transition-all duration-300 ease-in-out animate-fade-in
          flex items-start gap-3
        "
      >
        <Brain className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-accent-foreground mb-1">Memory Triggered</p>
          <p className="text-sm text-accent-foreground/80">{memory}</p>
        </div>
      </div>
    </div>
  );
};
