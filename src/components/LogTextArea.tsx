import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface LogSegment {
  id: string;
  text: string;
  color: string;
  emotion: string;
}

interface LogTextAreaProps {
  segments: LogSegment[];
  currentText: string;
  currentColor: string;
  onTextChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

export const LogTextArea = ({
  segments,
  currentText,
  currentColor,
  onTextChange,
  onKeyDown,
  placeholder,
}: LogTextAreaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [segments.length]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto bg-card/50 backdrop-blur-sm rounded-lg p-4"
      style={{
        borderWidth: '3px',
        borderColor: currentColor,
        boxShadow: `0 0 20px ${currentColor}20`,
      }}
    >
      {/* Render previous log segments as boxes */}
      {segments.map((segment, index) => (
        <motion.div
          key={segment.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-3 p-4 rounded-lg"
          style={{
            backgroundColor: `${segment.color}15`,
            borderLeft: `4px solid ${segment.color}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium capitalize px-2 py-1 rounded"
              style={{
                backgroundColor: segment.color,
                color: 'white',
              }}
            >
              {segment.emotion}
            </span>
            <span className="text-xs text-muted-foreground">
              Moment {index + 1}
            </span>
          </div>
          <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
            {segment.text}
          </p>
        </motion.div>
      ))}

      {/* Current editable textarea */}
      <textarea
        ref={inputRef}
        value={currentText}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        placeholder={segments.length === 0 ? placeholder : "Continue writing..."}
        className="w-full min-h-[200px] resize-none bg-transparent border-none focus:outline-none text-lg leading-relaxed text-foreground"
        style={{
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
};
