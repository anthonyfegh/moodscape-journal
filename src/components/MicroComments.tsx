import { useEffect, useState } from "react";

interface MicroCommentsProps {
  comments: string[];
  isTyping: boolean;
  cursorPosition: { x: number; y: number };
}

export const MicroComments = ({ comments, isTyping, cursorPosition }: MicroCommentsProps) => {
  const [visibleComment, setVisibleComment] = useState<string | null>(null);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (comments.length === 0) return;

    const latestComment = comments[comments.length - 1];
    setVisibleComment(latestComment);
    setShouldShow(true);
  }, [comments]);

  // Hide when typing starts
  useEffect(() => {
    if (isTyping) {
      setShouldShow(false);
    } else {
      // Show after user stops typing
      const timeout = setTimeout(() => {
        if (visibleComment) {
          setShouldShow(true);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, visibleComment]);

  if (!visibleComment || !shouldShow) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${cursorPosition.x}px`,
        top: `${cursorPosition.y + 20}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div
        className="transition-all duration-500 ease-out"
        style={{
          opacity: shouldShow && !isTyping ? 1 : 0,
          transform: shouldShow && !isTyping ? 'translateY(0)' : 'translateY(-10px)',
        }}
      >
        <p className="text-sm text-foreground/70 italic whitespace-nowrap">"{visibleComment}"</p>
      </div>
    </div>
  );
};
