import { useEffect, useRef } from "react";

interface LogTextAreaProps {
  currentText: string;
  currentColor: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

export const LogTextArea = ({
  currentText,
  currentColor,
  onTextChange,
  onKeyDown,
  placeholder,
}: LogTextAreaProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div 
      className="w-full h-full rounded-lg overflow-hidden"
      style={{
        borderWidth: '3px',
        borderColor: currentColor,
        boxShadow: `0 0 20px ${currentColor}20`,
      }}
    >
      <textarea
        ref={inputRef}
        value={currentText}
        onChange={onTextChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full h-full p-4 bg-card/50 backdrop-blur-sm border-none outline-none resize-none text-lg leading-relaxed text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
};
